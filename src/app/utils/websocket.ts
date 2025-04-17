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

// // backendService.ts (can be a service in your backend)
// import WebSocket from 'ws';

// let wsClient: WebSocket | null = null;

// export function connectToWebSocketServer() {
//   wsClient = new WebSocket('ws://<websocket-server-ip>:8080');

//   wsClient.on('open', () => {
//     console.log('Connected to WebSocket server');
//   });

//   wsClient.on('message', (data) => {
//     console.log('Received from WebSocket server:', data);
//   });

//   wsClient.on('close', () => {
//     console.log('Disconnected from WebSocket server');
//   });

//   wsClient.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// }

// // Send messages from your backend to WebSocket clients
// export function sendMessageToClients(message: string) {
//   if (wsClient && wsClient.readyState === WebSocket.OPEN) {
//     wsClient.send(message);
//   }
// }

// // Call this function when you need to send an update to clients
// connectToWebSocketServer();
