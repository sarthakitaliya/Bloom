export const initialFileStructure = `
Project root: /home/user/project

Framework:
- React + TypeScript (Vite)
- Tailwind CSS already configured

Editable locations:
- src/App.tsx
- src/components/ (add new components here)

Read-only / DO NOT MODIFY:
- src/main.tsx
- package.json
- package-lock.json
- tsconfig*.json
- vite.config.ts

Directory overview:
- public/
- src/
  - assets/
  - components/
  - App.tsx
  - index.css
  - main.tsx

Guidelines:
- Always call listFiles(projectId) if unsure about file existence.
- Always call readFile(projectId, filename) before modifying a file.
- Do not assume file contents from this description.
`;
