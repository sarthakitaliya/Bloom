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
  PanelLeft,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";
import { useSession } from "../../../lib/auth-client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

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
  const [leftWidth, setLeftWidth] = useState(30);
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"Preview" | "Editor">("Preview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRectRef = useRef<DOMRect | null>(null);

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
          if (data.success && data.restoring) {
            setLoading(true);
          } else if (data.success && !data.restoring) {
            setLoading(false);
          } else if (!data.success) {
            toast.error("Failed to extend sandbox session.");
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

          if (!projectData.data.previewUrl || projectData.restoring) {
            setProcessing(true);
          } else {
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

          // Project is initialized, stop processing state
          setProcessing(false);
          setCurrentStatus(null);

          setTimeout(() => {
            setUrl(`https://${data.previewUrl}`);
          }, 1000);
        });

        socket.on("agent-message", (message: string) => {
          console.log("agent-message", message);
          setProcessing(false);
          setCurrentStatus(null);

          setMessages((prevMessages) => [
            ...prevMessages,
            { from: "AGENT", content: message },
          ]);
        });
        socket.on("error-message", (message: string) => {
          console.error("Received ERROR from socket:", message);
          setProcessing(false);
          setCurrentStatus(null);
          toast.error(`Error: ${message}`);
          setMessages((prevMessages) => [
            ...prevMessages,
            { from: "AGENT", content: `Error: ${message}` },
          ]);
        });

        // Live status updates for tool calls
        socket.on("agent-status", (data: { type: string; toolName: string; args?: Record<string, any> }) => {
          if (data.type === "tool_start") {
            const statusMessages: Record<string, string> = {
              listFiles: "Exploring project files...",
              readFile: `Reading ${data.args?.filename || "file"}...`,
              createFile: `Creating ${data.args?.filename || "file"}...`,
              updateFile: `Updating ${data.args?.filename || "file"}...`,
              removeFile: `Removing ${data.args?.filename || "file"}...`,
              getLogs: "Checking for errors...",
              addDependency: `Installing ${data.args?.packageName || "package"}...`,
              removeDependency: `Removing ${data.args?.packageName || "package"}...`,
            };
            setCurrentStatus(statusMessages[data.toolName] || `Running ${data.toolName}...`);
          } else if (data.type === "tool_end") {
            // Keep showing status for a moment, then reset to thinking
            setTimeout(() => setCurrentStatus(null), 300);
          }
        });
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("agent-message");
        socketRef.current.off("agent-status");
        socketRef.current.off("preview-url");
        socketRef.current.off("error-message");
        socketRef.current.disconnect();
      }
    };
  }, [projectId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setInput("");
    setProcessing(true);
    setMessages((prev) => [...prev, { from: "USER", content: input }]);

    try {
      await api.post(`/conversations`, {
        projectId: projectId,
        prompt: input,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setProcessing(false);
    }
  };

  const handleMouseDown = React.useCallback((_e: React.MouseEvent) => {
    setDragging(true);
    document.body.style.cursor = "col-resize";
    if (containerRef.current) {
      dragRectRef.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  const handleMouseUp = React.useCallback(() => {
    setDragging(false);
    document.body.style.cursor = "";
    dragRectRef.current = null;
  }, []);

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragging || !dragRectRef.current) return;

      const rect = dragRectRef.current;
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
      if (input.trim() && !processing && !loading) {
        handleSend(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <header className="h-14 flex items-center px-4 border-b border-white/5 bg-[#0a0a0a] justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-50 hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-zinc-400 hover:text-zinc-50 hover:bg-white/5 transition-colors cursor-pointer",
              isSidebarCollapsed && "text-zinc-50 bg-white/5"
            )}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <PanelLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-2 border-l border-white/5 pl-3">
            <span className="font-semibold text-white truncate max-w-[200px] lg:max-w-md">
              {project?.title || "Project Workspace"}
            </span>
            {!loading &&
              project &&
              session?.user?.id &&
              session.user.id !== project.userId && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-medium border border-yellow-500/20">
                  Read Only
                </span>
              )}
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
              className="text-zinc-400 hover:text-zinc-50 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => window.open(url, "_blank")}
              title="Open in new tab"
            >
              <ExternalLink className="size-4" />
            </Button>
          )}

          <div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("Preview")}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer w-28 shrink-0",
                activeTab === "Preview"
                  ? "bg-zinc-800 text-zinc-50 shadow-sm ring-1 ring-white/10"
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-white/5"
              )}
            >
              <Eye className="size-3.5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab("Editor")}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer w-28 shrink-0",
                activeTab === "Editor"
                  ? "bg-zinc-800 text-zinc-50 shadow-sm ring-1 ring-white/10"
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-white/5"
              )}
            >
              <Code2 className="size-3.5" />
              Code
            </button>
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        id="split-container"
        className="flex-1 flex relative overflow-hidden"
      >
        <AnimatePresence initial={false}>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${leftWidth}%`, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: dragging ? 0 : 0.2, ease: "easeInOut" }}
              className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 max-w-[60vw] min-w-[250px]"
            >
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
                          ? "bg-zinc-100 text-zinc-950 rounded-tr-sm"
                          : msg.content.startsWith("Error:")
                            ? "bg-red-500/20 text-red-200 rounded-tl-sm border border-red-500/30"
                            : "bg-white/10 text-gray-200 rounded-tl-sm border border-white/5"
                      )}
                    >
                      {msg.from === "AGENT" ? (
                        msg.content.startsWith("Error:") ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="size-4 mt-0.5 text-red-400 shrink-0" />
                            <span>{msg.content}</span>
                          </div>
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                              code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-xs">{children}</code>,
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )
                      ) : (
                        msg.content
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground opacity-50 px-1">
                      {msg.from === "USER" ? "You" : "Bloom"}
                    </span>
                  </div>
                ))}
                {(processing || loading) && (
                  <div className="flex flex-col gap-1 max-w-[90%] mr-auto items-start">
                    <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-white/10 text-gray-200 rounded-tl-sm border border-white/5 flex items-center gap-2">
                      <Loader2 className="size-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        {currentStatus || "Thinking..."}
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
                      loading
                        ? "Loading..."
                        : project &&
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
                    className="absolute right-2 bottom-2 w-8 h-8 bg-transparent hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={
                      !input.trim() ||
                      processing ||
                      loading ||
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
            className={cn(
              "h-full w-full",
              dragging && "pointer-events-none select-none"
            )}
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
