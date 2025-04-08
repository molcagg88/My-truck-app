declare module 'ws' {
  import { EventEmitter } from 'events';
  import { IncomingMessage } from 'http';

  class WebSocket extends EventEmitter {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;

    binaryType: string;
    readonly bufferedAmount: number;
    readonly extensions: string;
    readonly protocol: string;
    readonly readyState: number;
    readonly url: string;

    constructor(address: string, options?: WebSocket.ClientOptions);
    constructor(address: string, protocols?: string | string[], options?: WebSocket.ClientOptions);

    close(code?: number, data?: string | Buffer): void;
    ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    send(data: any, cb?: (err?: Error) => void): void;
    terminate(): void;
  }

  namespace WebSocket {
    interface ClientOptions {
      protocol?: string;
      handshakeTimeout?: number;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      localAddress?: string;
      protocolVersion?: number;
      headers?: { [key: string]: string };
      origin?: string;
      agent?: boolean;
      host?: string;
      family?: number;
      checkServerIdentity?(servername: string, cert: any): boolean;
      rejectUnauthorized?: boolean;
      maxPayload?: number;
    }

    interface PerMessageDeflateOptions {
      zlibDeflateOptions?: {
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: Buffer | Buffer[] | DataView;
      };
      zlibInflateOptions?: {
        chunkSize?: number;
        windowBits?: number;
      };
      clientNoContextTakeover?: boolean;
      serverNoContextTakeover?: boolean;
      serverMaxWindowBits?: number;
      concurrencyLimit?: number;
      threshold?: number;
    }

    class Server extends EventEmitter {
      constructor(options?: ServerOptions);
      constructor(options?: ServerOptions, callback?: () => void);

      clients: Set<WebSocket>;
      close(cb?: (err?: Error) => void): void;
      handleUpgrade(request: IncomingMessage, socket: any, head: Buffer, callback: (client: WebSocket) => void): void;
    }

    interface ServerOptions {
      host?: string;
      port?: number;
      backlog?: number;
      server?: any;
      verifyClient?: VerifyClientCallbackAsync | VerifyClientCallbackSync;
      handleProtocols?: any;
      path?: string;
      noServer?: boolean;
      clientTracking?: boolean;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      maxPayload?: number;
    }

    type VerifyClientCallbackAsync = (info: { origin: string; secure: boolean; req: IncomingMessage }, callback: (res: boolean, code?: number, message?: string) => void) => void;
    type VerifyClientCallbackSync = (info: { origin: string; secure: boolean; req: IncomingMessage }) => boolean;
  }

  export = WebSocket;
} 