import { Server } from "socket.io";
import { connection as psub } from "@bloom/queue";

const io = new Server(4000, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);
  const { projectId } = socket.handshake.query;
  console.log("socket", projectId);

  if (!projectId) {
    socket.disconnect();
    return;
  }

  psub.subscribe(projectId as string, (err: any) => {
    if (err) {
      console.error("Failed to subscribe: ", err);
      return;
    }
    console.log("Subscribed successfully");
  });

  socket.on("join-project", (msg) => {
    console.log(`Project joined: ${msg}`);
    socket.join(projectId as string);
  });

  const handleMessage = (channel: any, message: any) => {
    if (channel !== projectId) return;

    console.log(`Received message from ${channel}: ${message}`);
    const data = JSON.parse(message);
    if (data.type === "Initialized") {
      socket.emit("project-url", message);
    } else if (data.type === "agentMsg") {
      socket.emit("agent-message", data.message);
      socket.emit("message", message);
    } else if (data.type === "ERROR") {
      socket.emit("error-message", data.message);
    }
  };

  psub.on("message", handleMessage);

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
    psub.off("message", handleMessage);
  });
});
