import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import FileTree from "./FileTree";
import { Loader2 } from "lucide-react";

export default function CodeView({ projectId }: { projectId: string }) {
  const [fileTree, setFileTree] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("// Select a file to view");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}/files`);
        setFileTree(data.data);
      } catch (error) {
        console.error("Error fetching file tree:", error);
      }
    };
    fetchFileTree();
  }, [projectId]);

  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath);
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`);
      setFileContent(data.data || "// File is empty");
    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContent("// Error loading file");
    } finally {
      setLoading(false);
    }
  };

  const getLanguage = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      css: "css",
      html: "html",
      md: "markdown",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
    };
    return languageMap[ext || ""] || "plaintext";
  };

  return (
    <div className="w-full h-full flex rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-inner">
      {/* File Tree Sidebar */}
      <div className="w-64 h-full border-r border-white/5 bg-[#121212]">
        {fileTree.length > 0 ? (
          <FileTree
            files={fileTree}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs gap-2">
            <Loader2 className="size-3 animate-spin" />
            Loading workspace...
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 h-full relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
        <Editor
          height="100%"
          language={selectedFile ? getLanguage(selectedFile) : "typescript"}
          value={fileContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            fontFamily: "Geist Mono, monospace",
            renderLineHighlight: "none",
          }}
          // Need to customize the theme to match our colors
          onMount={(editor, monaco) => {
            monaco.editor.defineTheme('bloom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#0a0a0a',
                'editor.lineHighlightBackground': '#ffffff05',
              }
            });
            monaco.editor.setTheme('bloom-dark');
          }}
        />
      </div>
    </div>
  );
}
