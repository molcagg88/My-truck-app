import { Server } from 'http';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { IncomingMessage } from 'http';

// Extend WebSocket interface to include our custom properties
interface WebSocketClient extends WebSocket {
  userId?: string;
  userType?: string;
  isAlive?: boolean;
  close(code?: number, data?: string | Buffer): void;
  terminate(): void;
  ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
  pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
  send(data: any, cb?: (err?: Error) => void): void;
  on(event: string, listener: (...args: any[]) => void): this;
  readyState: number;
}

interface Message {
  type: string;
  [key: string]: any;
}

/**
 * WebSocket server for real-time communication
 */
export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocketClient> = new Map();
  private pingInterval: NodeJS.Timeout;
  
  static instance: WebSocketServer;

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocketServer();
    this.pingInterval = setInterval(() => this.pingClients(), 30000);
    WebSocketServer.instance = this;
  }

  /**
   * Initialize WebSocket server and setup connection handling
   */
  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient, req: IncomingMessage) => {
      console.log('WebSocket client connected');
      
      // Parse token from URL
      const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
      const token = urlParams.get('token');
      
      if (!token) {
        console.log('No token provided, closing connection');
        ws.close(1008, 'Authorization required');
        return;
      }
      
      try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        ws.userId = decoded.id;
        ws.userType = decoded.role || 'user';
        ws.isAlive = true;
        
        // Add client to map
        this.clients.set(decoded.id, ws);
        
        console.log(`Authenticated client connected: ${decoded.id}, role: ${decoded.role}`);
        
        // Setup ping/pong for connection health checks
        ws.on('pong', () => {
          ws.isAlive = true;
        });
        
        // Handle messages from client
        ws.on('message', (message: string) => {
          try {
            const parsedMessage = JSON.parse(message) as Message;
            this.handleMessage(ws, parsedMessage);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
        
        // Handle client disconnect
        ws.on('close', () => {
          console.log(`WebSocket client disconnected: ${ws.userId}`);
          if (ws.userId) {
            this.clients.delete(ws.userId);
          }
        });
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection_established',
          userId: decoded.id,
          userType: decoded.role || 'user',
          timestamp: new Date().toISOString()
        }));
        
      } catch (error) {
        console.error('Authentication error:', error);
        ws.close(1008, 'Invalid token');
      }
    });
  }
  
  /**
   * Check if clients are still alive
   */
  private pingClients() {
    this.wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) {
        console.log(`Terminating inactive client: ${ws.userId}`);
        if (ws.userId) {
          this.clients.delete(ws.userId);
        }
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }
  
  /**
   * Handle incoming messages from clients
   */
  private handleMessage(ws: WebSocketClient, message: Message) {
    if (!ws.userId) return;
    
    switch (message.type) {
      case 'location_update':
        // Forward location update to relevant subscribers
        this.handleLocationUpdate(ws.userId, message);
        break;
      case 'trip_update':
        // Handle trip status updates
        this.handleTripUpdate(message);
        break;
      case 'ping':
        // Respond to ping messages
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }
  
  /**
   * Handle location updates
   */
  private handleLocationUpdate(senderId: string, message: Message) {
    // Process the location update from a user
    console.log(`Location update from ${senderId}:`, message.location);
    
    // Broadcast to relevant subscribers (e.g., in a trip context)
    if (message.tripId) {
      // Find clients involved in this trip
      this.broadcastToTrip(message.tripId, {
        type: 'location_update',
        userId: senderId,
        userType: message.userType,
        location: message.location,
        tripId: message.tripId,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Handle trip updates
   */
  private handleTripUpdate(message: Message) {
    if (!message.tripId) return;
    
    // Broadcast trip update to relevant users
    this.broadcastToTrip(message.tripId, {
      type: 'trip_update',
      tripId: message.tripId,
      status: message.status,
      timestamp: new Date().toISOString(),
      data: message.data
    });
  }
  
  /**
   * Broadcast a message to all clients involved in a trip
   */
  private broadcastToTrip(tripId: string, message: any) {
    // In a real app, you would look up which users are involved in this trip
    // For now, we'll use a mock implementation
    const mockTripParticipants = ['customer-id', 'driver-id']; // Replace with actual logic
    
    mockTripParticipants.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  /**
   * Broadcast a message to a specific user
   */
  public sendToUser(userId: string, message: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  
  /**
   * Broadcast a message to all connected clients
   */
  public broadcast(type: string, data: any) {
    const message = { type, ...data, timestamp: new Date().toISOString() };
    
    this.wss.clients.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  /**
   * Clean up resources
   */
  public close() {
    clearInterval(this.pingInterval);
    this.wss.close();
  }
} 