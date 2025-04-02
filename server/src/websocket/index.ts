import { Server, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../middleware/auth';
import { logger } from '../utils/logger';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
}

export class WebSocketServer {
  private wss: Server;
  private clients: Map<string, WebSocketClient>;

  constructor(server: HttpServer) {
    this.wss = new Server({ server });
    this.clients = new Map();
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      const client = ws as WebSocketClient;
      client.isAlive = true;

      // Handle authentication
      const token = req.url?.split('token=')[1];
      if (token) {
        try {
          const decoded = await verifyToken(token);
          client.userId = decoded.id;
          client.role = decoded.role;
          this.clients.set(decoded.id, client);
          logger.info(`Client connected: ${decoded.id}`);
        } catch (error) {
          logger.error('WebSocket authentication failed:', error);
          client.close(1008, 'Authentication failed');
          return;
        }
      }

      // Handle client messages
      client.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(client, data);
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      });

      // Handle client disconnection
      client.on('close', () => {
        if (client.userId) {
          this.clients.delete(client.userId);
          logger.info(`Client disconnected: ${client.userId}`);
        }
      });

      // Handle ping/pong for connection health
      client.on('pong', () => {
        client.isAlive = true;
      });
    });

    // Set up heartbeat interval
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = ws as WebSocketClient;
        if (!client.isAlive) {
          client.terminate();
          return;
        }
        client.isAlive = false;
        client.ping();
      });
    }, 30000);
  }

  private handleMessage(ws: WebSocketClient, data: any) {
    switch (data.type) {
      case 'LOCATION_UPDATE':
        this.broadcastLocationUpdate(data);
        break;
      case 'DRIVER_STATUS':
        this.broadcastDriverStatus(data);
        break;
      default:
        logger.warn(`Unknown message type: ${data.type}`);
    }
  }

  private broadcastLocationUpdate(data: any) {
    const message = JSON.stringify({
      type: 'LOCATION_UPDATE',
      driverId: data.driverId,
      location: data.location,
      timestamp: new Date().toISOString()
    });

    this.broadcastToAdmins(message);
  }

  private broadcastDriverStatus(data: any) {
    const message = JSON.stringify({
      type: 'DRIVER_STATUS',
      driverId: data.driverId,
      status: data.status,
      timestamp: new Date().toISOString()
    });

    this.broadcastToAdmins(message);
  }

  private broadcastToAdmins(message: string) {
    this.wss.clients.forEach((ws) => {
      const client = ws as WebSocketClient;
      if (client.role === 'ADMIN' && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public sendToClient(userId: string, message: string) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
} 