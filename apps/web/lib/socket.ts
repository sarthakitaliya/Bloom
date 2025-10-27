import { io } from "socket.io-client";

let socket;

function initializeSocket(projectId: string) {
  socket = io("http://localhost:4000", {
    query: { projectId },
    transports: ["websocket"],
    autoConnect: true,
  });
  return socket;
}

export default initializeSocket;
