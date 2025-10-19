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

`

const indexCss = `
@import "tailwindcss";
`


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
`;