import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import FileTree from "./FileTree";

export default function CodeView({ projectId }: { projectId: string }) {
  const [fileTree, setFileTree] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("// Select a file to view");

  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}/files`);
        setFileTree(data.data);
        console.log("fetched ", data.data);
      } catch (error) {
        console.error("Error fetching file tree:", error);
      }
    };
    fetchFileTree();
  }, [projectId]);

  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath);
    // TODO: Fetch file content from API
    try {
      const { data } = await api.get(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`);
      setFileContent(data.data || "// File is empty");
    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContent("// Error loading file");
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
    <div className="w-full h-full flex border border-gray-700 rounded-md overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-64 h-full border-r border-gray-700 bg-[#1e1e1e]">
        {fileTree.length > 0 ? (
          <FileTree
            files={fileTree}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        ) : (
          <div className="text-gray-400 p-4 text-sm">Loading files...</div>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 h-full">
        <Editor
          height="100%"
          language={selectedFile ? getLanguage(selectedFile) : "typescript"}
          value={fileContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}
