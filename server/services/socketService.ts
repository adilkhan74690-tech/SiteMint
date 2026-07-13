import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

export function initSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Allow clients to join rooms matching their business/tenant ID
    socket.on("join-tenant", (businessId: string | number) => {
      const room = `tenant_${businessId}`;
      socket.join(room);
      console.log(`🏢 Client ${socket.id} joined tenant room: ${room}`);
    });

    // Allow staff members to join a specific roles room
    socket.on("join-staff", (businessId: string | number) => {
      const room = `tenant_${businessId}_staff`;
      socket.join(room);
      console.log(`👥 Staff client joined professional room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit a real-time event to all connected clients under a specific tenant.
 */
export function emitToTenant(
  businessId: string | number,
  event: string,
  payload: any
): void {
  if (!io) return;
  const room = `tenant_${businessId}`;
  io.to(room).emit(event, payload);
  console.log(`[SocketIO] Broadcast event "${event}" to "${room}"`);
}

/**
 * Emit a real-time event specifically to staff members of a tenant (e.g. notifications of a booking, new order).
 */
export function emitToStaff(
  businessId: string | number,
  event: string,
  payload: any
): void {
  if (!io) return;
  const room = `tenant_${businessId}_staff`;
  io.to(room).emit(event, payload);
  console.log(`[SocketIO] Broadcast event "${event}" to staff room: "${room}"`);
}

export { io };
