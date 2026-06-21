import type { Server as HttpServer } from 'node:http';
import type { Comment } from '@comments-spa/shared';
import { Server as SocketServer } from 'socket.io';

export const COMMENTS_NEW_EVENT = 'comments:new' as const;

let io: SocketServer | null = null;

export const initWebSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const emitNewComment = (comment: Comment): void => {
  if (!io) {
    console.warn(
      'WebSocket server is not initialized; skipping comment broadcast',
    );
    return;
  }

  io.emit(COMMENTS_NEW_EVENT, comment);
};
