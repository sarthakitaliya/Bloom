import { useState } from "react";
import { FileNode } from "../types/CodeView";
import { File, Folder, FolderOpen, FileCode, FileJson, FileType, FileImage } from "lucide-react";
import { cn } from "../lib/utils";

// Helper to get icon based on extension
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className="size-4 text-blue-400" />;
    case 'css':
    case 'scss':
      return <FileType className="size-4 text-indigo-400" />;
    case 'json':
      return <FileJson className="size-4 text-yellow-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <FileImage className="size-4 text-purple-400" />;
    default:
      return <File className="size-4 text-muted-foreground" />;
  }
};

export default function FileTreeNode({
  node,
  onFileSelect,
  selectedFile,
  level = 0,
}: {
  node: FileNode;
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  const isSelected = selectedFile === node.path;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm transition-colors border-l-2 border-transparent",
          isSelected
            ? "bg-primary/10 text-primary-foreground border-primary"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="shrink-0">
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="size-4 text-primary" />
            ) : (
              <Folder className="size-4 text-primary/70" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}