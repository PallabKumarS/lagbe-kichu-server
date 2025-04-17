import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

type NotificationPayload = {
  userId?: string;
  content: string;
  [key: string]: any;
};

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: any) => {
    console.log('Client connected');
    ws.userId = null;
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data: any) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'init' && msg.userId) {
        ws.userId = msg.userId;
      }
    });

    ws.on('close', () => {});
  });

  // Heartbeat
  heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws: any) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 20000);

  return wss;
}

export function getWSS() {
  if (!wss) throw new Error('WebSocketServer not initialized');
  return wss;
}

export function broadcast(payload: NotificationPayload) {
  if (!wss) return;

  const message = JSON.stringify(payload);

  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      // If targeted to specific user
      if (payload.userId) {
        if (client.userId === payload.userId) {
          client.send(message);
        }
      } else {
        // Send to everyone
        client.send(message);
      }
    }
  });
}
