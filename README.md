# Bloom — AI Website Builder

Bloom is an AI-powered website builder that turns simple prompts into complete, working websites.  
Users describe what they want, and Bloom generates the code, build it into a sandbox, and streams live updates back to the client.

## Features
- Natural-language prompt → fully generated website
- Rewrites and improvements on request (like **“change bg color”**)
- Real-time events through WebSocket (logs, preview URL, status)
- Snapshots stored in S3 for rollback and fast loading
- Automatic build and deploy in an isolated sandbox

## Architecture
<img width="1890" height="1198" alt="image" src="https://github.com/user-attachments/assets/cb0ca3cb-2d57-44ea-9fe1-a5b2f6521085" />

## Flow (high level)

1. **Client** sends prompt to create or edit a website.  
2. **Backend** validates the request and pushes a job into a **queue**.  
3. **Worker** consumes the job, generates code/content using the **agent**, and pushes preview URL + status updates.  
4. **Agent** updates the code inside an isolated sandbox and returns build/deploy status.  
5. **Snapshot** saves the generated output to **S3** for preview, rollback, and fast load.  
6. **Worker** publishes events to **Pub/Sub**.  
7. **WS-server** streams real-time updates (status, preview link, logs) to the **Client**.

---

