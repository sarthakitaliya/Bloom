"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/axios";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/projects/${params.projectId}/agent`);
        console.log("Agent Response:", data);
        setUrl(data.data.previewUrl);
        console.log(url);
        
      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.projectId]);
  const [messages, setMessages] = useState([
    { role: "system", content: "Welcome! Start chatting about your project." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // TODO: Send to backend and get response, then update messages
  };

  // Resizable panel state
  const [leftWidth, setLeftWidth] = useState(50); // percent
  const [dragging, setDragging] = useState(false);

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
    <div id="split-container" className="flex h-screen w-full relative select-none">
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
              className={`mb-2 text-sm ${msg.role === "user" ? "text-blue-400" : "text-gray-300"}`}
            >
              <span className="font-semibold mr-2">
                {msg.role === "user" ? "You" : "System"}:
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
      >
      </div>
      {/* Right: Preview */}
      <div
        className="h-full bg-[#23243a] flex items-center justify-center"
        style={{ width: `${100 - leftWidth}%`, minWidth: "20%", maxWidth: "80%", marginLeft: "2px" }}
      >
        <iframe
          src={url}
          title="Project Preview"
          className="size-[99%] rounded-xl border border-gray-700 shadow-lg bg-white"
        />
      </div>
    </div>
  );
}
