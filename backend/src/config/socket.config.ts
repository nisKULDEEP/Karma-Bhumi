import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';

// Map to store active connections with userId as key
const connectedUsers = new Map<string, string>();

export const configureSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Handle authentication
    socket.on('authenticate', (userId: string) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
      
      // Join personal room
      socket.join(`user:${userId}`);
    });

    // Handle joining workspace
    socket.on('joinWorkspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove from connectedUsers
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

// Global access to the socket server
let socketServer: Server;

export const initSocketServer = (httpServer: HttpServer) => {
  socketServer = configureSocket(httpServer);
  return socketServer;
};

export const getSocketServer = () => {
  if (!socketServer) {
    throw new Error('Socket server not initialized');
  }
  return socketServer;
};

export const getUserSocketId = (userId: string) => {
  return connectedUsers.get(userId);
};