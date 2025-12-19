import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function initializeSocket(projectId: string): Socket {
  socket = io(process.env.SOCKET_SERVER_URL, {
    query: { projectId },
    transports: ["websocket"],
    autoConnect: true,
  });
  return socket;
}

export default initializeSocket;
