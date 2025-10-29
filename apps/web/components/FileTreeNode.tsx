import { useState } from "react";
import { FileNode } from "../types/CodeView";
import { File, Folder, FolderOpen } from "lucide-react";


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
  const [isExpanded, setIsExpanded] = useState(level === 0); // Auto-expand root level

  const handleClick = () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  const isSelected = selectedFile === node.path;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-700 transition ${
          isSelected ? "bg-blue-600 text-white" : "text-gray-200"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" && (
          <span className="text-xs">{isExpanded ? <FolderOpen size={19}/> : <Folder size={19}/>}</span>
        )}
        {node.type === "file" && <span className="text-xs"><File size={19}/></span>}
        <span className="text-sm">{node.name}</span>
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