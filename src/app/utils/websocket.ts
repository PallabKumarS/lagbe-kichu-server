import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: any) => {
    console.log('Client connected');
    ws.isAlive = true;

    ws.send(
      JSON.stringify({ type: 'welcome', message: 'Connected to server' }),
    );

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data: any) => {
      console.log('Received:', data.toString());
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Heartbeat
  heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws: any) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  return wss;
}

export function getWSS() {
  if (!wss) throw new Error('WebSocketServer not initialized');
  return wss;
}

export function broadcast(message: string) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
