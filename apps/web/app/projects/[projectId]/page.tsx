"use client";

import React, { useEffect, useRef, useState } from "react";
import api from "../../../lib/axios";
import { io, Socket } from "socket.io-client";
import initializeSocket from "../../../lib/socket";
import Preview from "../../../components/Preview";
import CodeView from "../../../components/CodeView";

interface Message {
  id?: string;
  from: "USER" | "AGENT";
  projectId?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [url, setUrl] = useState("");
  const [input, setInput] = useState("");
  const [leftWidth, setLeftWidth] = useState(50); // percent
  const [dragging, setDragging] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [panned, setPanned] = useState<"Preview" | "Editor">("Preview");

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          console.log("Extending sandbox timeout...");
          const { data } = await api.post(
            `/projects/${projectId}/extend-sandbox`
          );
          if (data.success) {
            if (data.restoring) {
              setRestoring(true);
            } else {
              console.log("Sandbox extended successfully");
              setRestoring(false);
            }
          } else {
            //TODO: show error to user
            console.error("Failed to extend sandbox:", data.message);
          }
        } catch (error) {
          console.error("Error extending sandbox:", error);
        }
      },
      1000 * 60 * 9
    ); // Extend every 9 minutes

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    async function fetchProject() {
      try {
        const { data: projectData } = await api.get(`/projects/${projectId}`);
        if (projectData.success) {
          const { data: conversationData } = await api.get(
            `/conversations/${projectId}`
          );
          setMessages(conversationData.data);
          if (!projectData.restoring) {
            setTimeout(() => {
              setUrl(projectData.data.previewUrl);
            }, 8000); // slight delay to ensure preview is ready
          }
        }
        setLoading(true);

        const socket = initializeSocket(projectId);
        socketRef.current = socket;
        socket.on("connect", () => {
          console.log("Connected to WebSocket server:", socket.id);
          socket.emit("join-project", projectId);
        });

        socket.on("message", (msg) => {
          console.log("msg c....");
          console.log("Message from server:", msg);
        });
        socket.on("preview-url", (msg) => {
          const data = JSON.parse(msg);
          console.log("preview-url", data);
          setUrl(`https://${data.previewUrl}`);
        });
        socket.on("error", (err) => {
          console.error("WebSocket error:", err);
        });
        socket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
        });
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId]);
  const handleSend = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!input.trim()) return;
      const response = await api.post(`/conversations`, {
        projectId: projectId,
        prompt: input,
      });
      setMessages([...messages, { from: "USER", content: input }]);
      console.log("Response from backend:", response.data);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Mouse event handlers for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    document.body.style.cursor = "col-resize";
  };
  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.cursor = "";
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    // Get the parent container width
    const container = document.getElementById("split-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.max(20, Math.min(80, percent)); // Clamp between 20% and 80%
    setLeftWidth(percent);
  };
  // Attach/detach mousemove/up listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      id="split-container"
      className="flex h-screen w-full relative select-none"
    >
      {/* Left: Chat */}
      <div
        className="h-full flex flex-col bg-[#181A20] p-6 border-r border-gray-800"
        style={{ width: `${leftWidth}%`, minWidth: "20%", maxWidth: "80%" }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Chat</h2>
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 text-sm ${msg.from === "USER" ? "text-blue-400" : "text-gray-300"}`}
            >
              <span className="font-semibold mr-2">
                {msg.from === "USER" ? "You" : "System"}:
              </span>
              {msg.content}
            </div>
          ))}
        </div>
        <form className="flex" onSubmit={handleSend}>
          <input
            className="flex-1 rounded-l-lg px-4 py-2 bg-[#23243a] text-white outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg font-semibold"
          >
            Send
          </button>
        </form>
      </div>
      {/* Resizer */}
      <div
        className="w-2 h-full bg-gray-700 cursor-col-resize z-10 absolute top-0"
        style={{ left: `calc(${leftWidth}% - 4px)` }}
        onMouseDown={handleMouseDown}
      ></div>
      {/* Right: Preview */}
      <div
        className="h-full bg-[#23243a] flex items-center justify-center"
        style={{
          width: `${100 - leftWidth}%`,
          minWidth: "20%",
          maxWidth: "80%",
          marginLeft: "2px",
        }}
      >
        {loading ? (
          <p className="text-white">Loading project...</p>
        ) : url === "" ? (
          <p className="text-white">Initializing project...</p>
        ) : (
          <>
            <div className="size-full">
              <button
                className={`px-4 py-2 m-2 rounded-lg font-semibold cursor-pointer ${
                  panned === "Preview"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
                onClick={() => setPanned("Preview")}
              >
                Preview
              </button>
              <button
                className={`px-4 py-2 m-2 rounded-lg font-semibold cursor-pointer ${
                  panned === "Editor"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
                onClick={() => setPanned("Editor")}
              >
                Editor
              </button>
              {panned === "Editor" ? (
                <CodeView projectId={projectId} />
              ) : (
                <Preview url={url} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
