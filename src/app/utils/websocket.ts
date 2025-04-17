import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: any) => {
    console.log('Client connected');
    ws.isAlive = true;

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
