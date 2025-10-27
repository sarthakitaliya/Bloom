export const appTsx = `
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

`;
export const summary = [
  {
    file: "./public/vite.svg",
    summary:
      "This file contains an SVG image of the Vite logo. It uses linear gradients for color and defines paths to create the logo's shape.",
  },
  {
    file: "./src/assets/react.svg",
    summary:
      "This file contains an SVG image of the React logo. It defines the shape and colors of the logo using SVG path elements.",
  },
  {
    file: "./src/App.css",
    summary:
      "This CSS file defines styles for a React application. It includes styles for the root element, a logo with hover effects and animations, and a card element. It also includes a media query for reduced motion preferences.",
  },
  {
    file: "./src/App.tsx",
    summary:
      "This React component displays a counter and logos for Vite and React. It uses the useState hook to manage the counter's value and includes links to the Vite and React documentation. The component also provides instructions for testing Hot Module Replacement (HMR).",
  },
  {
    file: "./src/index.css",
    summary:
      "This CSS file imports the Tailwind CSS library. It uses the @import directive to include the tailwindcss file, which provides utility classes for styling the application.",
  },
  {
    file: "./src/main.tsx",
    summary:
      "This file is the entry point of a React application. It imports necessary modules from 'react' and 'react-dom/client', along with the stylesheet 'index.css' and the main application component 'App'. The code then renders the 'App' component within React's StrictMode, mounting it to the DOM element with the ID 'root'.",
  },
  {
    file: "./.gitignore",
    summary:
      "This file specifies intentionally untracked files that Git should ignore. It includes directories for logs, node modules, distribution files, and editor-related files and settings. This helps to keep the repository clean and prevents unnecessary files from being tracked.",
  },
  {
    file: "./README.md",
    summary:
      "This README provides a minimal setup for React with TypeScript and Vite, including HMR and ESLint rules. It details the use of official plugins like @vitejs/plugin-react and @vitejs/plugin-react-swc for Fast Refresh, and mentions the React Compiler. The document also provides guidance on expanding the ESLint configuration for production applications, including type-aware lint rules and the installation of additional plugins for React-specific rules.",
  },
  {
    file: "./eslint.config.js",
    summary:
      "This file configures ESLint for a TypeScript and React project. It extends recommended configurations from ESLint, TypeScript ESLint, React Hooks, and React Refresh, and specifies global variables for the browser environment. It also ignores the 'dist' directory.",
  },
  {
    file: "./index.html",
    summary:
      "This HTML file sets up the basic structure for a web page. It includes meta tags for character set, viewport, and a title. It also links to a stylesheet and a JavaScript file for the main application logic.",
  },
  {
    file: "./package-lock.json",
    summary:
      "This file describes the dependencies and devDependencies for the 'user' project, including React, Tailwind CSS, and various ESLint and TypeScript packages. It specifies the versions of each package and their dependencies, ensuring consistent installations across different environments. The file also includes details about the build tools and plugins used in the project.",
  },
  {
    file: "./package.json",
    summary:
      "This file is a package.json file, which defines the project's metadata, dependencies, and scripts. It specifies the project name, version, dependencies for react, tailwindcss, and vite, and development dependencies for typescript, eslint, and related plugins.",
  },
  {
    file: "./tsconfig.app.json",
    summary:
      "This file configures the TypeScript compiler for the application. It specifies compiler options such as target, module, and JSX settings, along with linting rules. The configuration includes settings for module resolution, type checking, and import handling.",
  },
  {
    file: "./tsconfig.json",
    summary:
      "This file configures the TypeScript compiler. It references other configuration files, specifically tsconfig.app.json and tsconfig.node.json, to define the project's build settings.",
  },
  {
    file: "./tsconfig.node.json",
    summary:
      "This file configures the TypeScript compiler for Node.js environments. It specifies compiler options such as target, module, and linting rules, along with including the vite.config.ts file.",
  },
  {
    file: "./vite.config.ts",
    summary:
      "This file configures Vite, a build tool for modern web development. It imports necessary plugins for React and Tailwind CSS. The configuration includes plugins for React and Tailwind CSS, and server settings to allow all hosts.",
  },
];

const indexCss = `
@import "tailwindcss";
`;

export const initialFileStructure = `
    - /home/user/public/
    - /home/user/eslint.config.js
    - /home/user/index.html
    - /home/user/package-lock.json
    - /home/user/package.json
    - /home/user/README.md
    - /home/user/tsconfig.app.json
    - /home/user/tsconfig.json
    - /home/user/tsconfig.node.json
    - /home/user/tailwind.config.js
    - /home/user/vite.config.ts
    - /home/user/src/
    - /home/user/src/assets/
    - /home/user/src/App.css
    - /home/user/src/App.tsx
    - /home/user/src/index.css
    - /home/user/src/main.tsx

    App.tsx looks like this:
    ${appTsx}
    index.css looks like this:
    ${indexCss}

    here is the structure in brief:
    ${summary}
`;
