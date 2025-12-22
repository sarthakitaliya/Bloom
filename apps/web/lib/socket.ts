import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function initializeSocket(projectId: string): Socket {
  console.log(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);

  socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
    query: { projectId },
    transports: ["websocket"],
    autoConnect: true,
  });
  return socket;
}

export default initializeSocket;
