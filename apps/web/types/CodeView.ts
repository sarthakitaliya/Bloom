export type FileNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
};

export type FileTreeProps = {
  files: string[];
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
};