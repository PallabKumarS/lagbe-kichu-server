import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { Server } from 'http';
import { startDiscountCronJob } from './app/utils/discountStart&Reset';
import { WebSocketServer } from 'ws';

let server: Server;
export let wss: WebSocketServer;

async function main() {
  try {
    // connect to database
    await mongoose.connect(config.database_url as string, {
      dbName: 'lagbeKichuDB',
    });

    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
      console.log(`🚀 Server is running successfully! 🚀`);
    });

    const wss = new WebSocketServer({
      server,
    });

    // 🔁 Heartbeat checker (every 30s)
    setInterval(() => {
      wss.clients.forEach((ws: any) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    // wss server initial start up event
    wss.on('listening', () => {
      console.log('WebSocket server is running and listening for connections!');
    });

    // start ws server and listen for connections
    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.send(
        JSON.stringify({ type: 'welcome', message: 'Connected to server' }),
      );

      ws.on('message', (data) => {
        console.log('Received:', data.toString());
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    // start cron job
    startDiscountCronJob();
  } catch (err) {
    console.log(err);
  }
}
main();

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection detected, closing server...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception detected, closing server...', err);
  process.exit(1);
});
