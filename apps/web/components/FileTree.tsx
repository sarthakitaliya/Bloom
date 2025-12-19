import FileTreeNode from "./FileTreeNode";
import { FileNode, FileTreeProps } from "../types/CodeView";

// Convert flat array of paths to tree structure
function buildTree(paths: string[]): FileNode[] {
  const root: { [key: string]: any } = {};

  paths.forEach((path) => {
    const parts = path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          type: index === parts.length - 1 ? "file" : "folder",
          children: {},
        };
      }
      if (index < parts.length - 1) {
        current = current[part].children;
      }
    });
  });

  const convertToArray = (obj: any): FileNode[] => {
    return Object.values(obj).map((node: any) => ({
      name: node.name,
      path: node.path,
      type: node.type,
      children:
        node.type === "folder" ? convertToArray(node.children) : undefined,
    }));
  };

  return convertToArray(root);
}

export default function FileTree({
  files,
  onFileSelect,
  selectedFile,
}: FileTreeProps) {
  const tree = buildTree(files);

  return (
    <div className="w-full h-full font-mono">
      <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5">
        Explorer
      </div>
      <div className="py-2">
        {tree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
        {files.length === 0 && (
          <div className="px-4 py-4 text-xs text-muted-foreground text-center italic">
            No files found
          </div>
        )}
      </div>
    </div>
  );
}
