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
    <div className="w-full h-full bg-[#1e1e1e] overflow-y-auto">
      <div className="py-2">
        {tree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
}
