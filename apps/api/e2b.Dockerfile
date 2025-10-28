FROM e2bdev/code-interpreter:latest

WORKDIR /home/user

# Create Vite project with React + TypeScript template
RUN npm create vite@latest . -- --template react-ts && \
    npm install

# Install Tailwind and the Vite plugin
RUN npm install tailwindcss @tailwindcss/vite
RUN npm i nohup -g

# Write minimal vite.config.ts with Tailwind plugin
RUN printf "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\n\nexport default defineConfig({\n  plugins: [ react(), tailwindcss() ],\n  server: { host: true, allowedHosts: true }\n})\n" > vite.config.ts

# Create a CSS import file and import Tailwind
RUN mkdir -p src && printf "@import \"tailwindcss\";\n" > src/index.css
