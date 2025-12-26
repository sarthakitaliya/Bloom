"use client";

import React, { useEffect, useRef, useState } from "react";
import api from "../../../lib/axios";
import { Socket } from "socket.io-client";
import initializeSocket from "../../../lib/socket";
import Preview from "../../../components/Preview";
import CodeView from "../../../components/CodeView";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Send,
  Code2,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";
import { useSession } from "../../../lib/auth-client";

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
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [url, setUrl] = useState("");
  const [input, setInput] = useState("");
  const [leftWidth, setLeftWidth] = useState(30); // Default to smaller chat width
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"Preview" | "Editor">("Preview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const { data } = await api.post(
            `/projects/${projectId}/extend-sandbox`
          );
          if (data.success && !data.restoring) {
            // success
          }
        } catch (error) {
          console.error("Error extending sandbox:", error);
        }
      },
      1000 * 60 * 9
    );
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data: projectData } = await api.get(`/projects/${projectId}`);
        if (projectData.success) {
          setProject(projectData.data);
          const { data: conversationData } = await api.get(
            `/conversations/${projectId}`
          );
          setMessages(conversationData.data);
          if (!projectData.restoring) {
            setTimeout(() => {
              setUrl(projectData.data.previewUrl);
            }, 2000);
          }
        }

        const socket = initializeSocket(projectId);
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join-project", projectId);
        });

        socket.on("project-url", (msg) => {
          const data = JSON.parse(msg);
          console.log("PROJECT URL RECEIVED", data);

          setTimeout(() => {
            setUrl(`https://${data.previewUrl}`);
          }, 1000);
        });

        socket.on("agent-message", (message: string) => {
          console.log("agent-message", message);
          setProcessing(false);

          setMessages((prevMessages) => [
            ...prevMessages,
            { from: "AGENT", content: message },
          ]);
        });
        socket.on("error-message", (message: string) => {
          console.error("Received ERROR from socket:", message);
          setProcessing(false);
          // TODO: Handle error display in UI properly
          setMessages((prevMessages) => [
            ...prevMessages,
            { from: "AGENT", content: `Error: ${message}` },
          ]);
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
        socketRef.current.off("agent-message");
        socketRef.current.off("preview-url");
        socketRef.current.disconnect();
        socketRef.current.disconnect();
      }
    };
  }, [projectId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempInput = input;
    setInput(""); // Optimistic clear
    setProcessing(true);
    setMessages((prev) => [...prev, { from: "USER", content: tempInput }]);

    try {
      await api.post(`/conversations`, {
        projectId: projectId,
        prompt: tempInput,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setProcessing(false);
      // Revert if needed, but for now just log
    }
  };

  // Drag logic
  const handleMouseDown = React.useCallback((_e: React.MouseEvent) => {
    setDragging(true);
    document.body.style.cursor = "col-resize";
  }, []);

  const handleMouseUp = React.useCallback(() => {
    setDragging(false);
    document.body.style.cursor = "";
  }, []);

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      const container = document.getElementById("split-container");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(15, Math.min(60, percent)); // Limits
      setLeftWidth(percent);
    },
    [dragging]
  );

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
  }, [dragging, handleMouseMove, handleMouseUp]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !processing) {
        handleSend(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Header (Simplified for Workspace) */}
      <header className="h-14 flex items-center px-4 border-b border-white/5 bg-[#0a0a0a] justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Project Workspace</span>
            {
              !loading &&
              project &&
              session?.user?.id &&
              session.user.id !== project.userId && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-medium border border-yellow-500/20">
                  Read Only
                </span>
              )
            }
            {loading && (
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {url && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-white cursor-pointer"
              onClick={() => window.open(url, "_blank")}
              title="Open in new tab"
            >
              <ExternalLink className="size-4" />
            </Button>
          )}

          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("Preview")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                activeTab === "Preview"
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Eye className="size-3.5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab("Editor")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                activeTab === "Editor"
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Code2 className="size-3.5" />
              Code
            </button>
          </div>
        </div>
      </header>

      <div
        id="split-container"
        className="flex-1 flex relative overflow-hidden"
      >
        <AnimatePresence initial={false}>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${leftWidth}%`, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 max-w-[60vw] min-w-[250px]"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Terminal className="size-4" />
                  <span>Terminal & Chat</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsSidebarCollapsed(true)}
                >
                  <PanelLeftClose className="size-3.5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col gap-1 max-w-[90%]",
                      msg.from === "USER"
                        ? "ml-auto items-end"
                        : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.from === "USER"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white/10 text-gray-200 rounded-tl-sm border border-white/5"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground opacity-50 px-1">
                      {msg.from === "USER" ? "You" : "Bloom"}
                    </span>
                  </div>
                ))}
                {processing && (
                  <div className="flex flex-col gap-1 max-w-[90%] mr-auto items-start">
                    <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-white/10 text-gray-200 rounded-tl-sm border border-white/5 flex items-center gap-2">
                      <Loader2 className="size-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
                <form
                  onSubmit={handleSend}
                  className="relative flex items-end bg-white/5 border border-white/10 rounded-xl focus-within:ring-1 focus-within:ring-primary/50 transition-all"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={
                      loading ||
                      (!loading &&
                        project &&
                        session?.user?.id &&
                        session.user.id !== project.userId)
                    }
                    placeholder={
                      !loading &&
                        project &&
                        session?.user?.id &&
                        session.user.id !== project.userId
                        ? "View Only Mode – You cannot send messages here."
                        : "Ask Bloom to make changes..."
                    }
                    className="w-full bg-transparent border-0 focus:ring-0 resize-none outline-none text-sm px-4 py-3 min-h-[48px] max-h-[200px] overflow-y-auto text-gray-200 placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ height: "48px" }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 bottom-2 w-8 h-8 bg-transparent hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !input.trim() ||
                      processing ||
                      (project && session?.user?.id !== project.userId)
                    }
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isSidebarCollapsed && (
          <div className="absolute top-4 left-4 z-20">
            <Button
              size="icon"
              className="bg-background border border-white/10 shadow-lg hover:bg-white/5"
              onClick={() => setIsSidebarCollapsed(false)}
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </div>
        )}

        {!isSidebarCollapsed && (
          <div
            className="w-1 h-full bg-white/5 hover:bg-primary/50 cursor-col-resize transition-colors z-10 flex items-center justify-center group"
            onMouseDown={handleMouseDown}
          >
            <div className="h-8 w-1 bg-white/20 rounded-full group-hover:bg-primary" />
          </div>
        )}

        <div className="flex-1 bg-[#050505] p-4 h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {activeTab === "Preview" ? (
              <Preview url={url} />
            ) : (
              <CodeView projectId={projectId} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
