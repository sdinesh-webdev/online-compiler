# Project Blueprint: Online JavaScript Compiler

## 1. Project Overview
This document serves as the master blueprint for building a secure, monetizable online JavaScript compiler. It is structured to provide clear, deterministic instructions for any AI coding agent or human developer to follow. 

**Objective:** Build a web application where users can write JavaScript code in a browser-based editor, submit it, and receive the execution output securely. The system must isolate code execution to prevent malicious server attacks.

---

## 2. Tech Stack
* **Frontend:** Astro (React integration enabled for complex interactive components)
* **Code Editor:** Monaco Editor (via `@monaco-editor/react`)
* **Backend API:** Node.js with Express.js
* **Execution Engine:** Docker (Node Alpine image)
* **Deployment:** * Frontend: Vercel / Netlify / Cloudflare Pages
    * Backend: Render / Koyeb (Docker container deployment)

---

## 3. System Architecture Flow
1.  **Client (Astro):** User types code into the Monaco Editor and clicks "Run".
2.  **API Gateway (Express):** Receives the `POST` request containing the code payload.
3.  **Sanitization:** API validates the payload (checks size limits, string type).
4.  **Execution (Docker):** API spawns a temporary Docker container, passes the code to it, and captures `stdout` and `stderr`.
5.  **Response:** The container is destroyed. The API sends the output back to the Client.

---

## 4. Step-by-Step Implementation Guide

### Phase 1: Frontend Setup (Astro + Monaco)
**Goal:** Create a fast, responsive UI with a professional code editor.

1.  Initialize Astro project: `npm create astro@latest` (Use empty template, enable TypeScript).
2.  Add React integration: `npx astro add react`.
3.  Install editor: `npm install @monaco-editor/react`.
4.  Create `Editor.jsx` component inside `src/components/`.
5.  In `src/pages/index.astro`, render `<Editor client:only="react" />` alongside a "Run Code" button and an "Output" display terminal.

### Phase 2: Backend Setup (Express.js API)
**Goal:** Create an endpoint to handle execution requests.

1.  Initialize a new Node.js project: `npm init -y` and `npm install express cors body-parser`.
2.  Create `server.js`.
3.  Set up basic Express server running on port 3000.
4.  Enable CORS (Cross-Origin Resource Sharing) so the Astro frontend can communicate with it.
5.  Create a `POST /execute` endpoint.

### Phase 3: The Execution Engine (Docker Integration)
**Goal:** Safely execute the untrusted user code.

1.  Inside the `POST /execute` endpoint, use Node's `child_process.exec`.
2.  Construct the Docker command: 
    * *Crucial parameters:* `--rm` (remove container after run), `--net none` (disable internet access), `-m 50m` (limit memory to 50MB).
    * *Example Command:* `docker run --rm --net none -m 50m node:18-alpine node -e "<user_code>"`
3.  **Security Notice:** Implement a timeout (e.g., 5000ms) to kill the process if the code contains an infinite loop.

### Phase 4: Containerization & Deployment
**Goal:** Prepare the backend for free-tier cloud deployment.

1.  Create a `Dockerfile` for the backend server itself (not the executor container, but the API).
    * *Note:* The backend needs access to the Docker daemon. For Koyeb/Render, look into "Docker-in-Docker" (DinD) setups or use isolated serverless functions for execution if DinD is unavailable.
2.  Set up a GitHub repository.
3.  Deploy Frontend to Vercel (connect GitHub repo).
4.  Deploy Backend to Koyeb using the `Dockerfile` (connect GitHub repo).

---

## 5. Strict Instructions for AI Agents
When reading this document to write code, adhere strictly to the following rules to prevent errors:

1.  **Do Not Skip Steps:** Implement one phase completely before moving to the next.
2.  **Security First:** NEVER use `eval()` or `Function()` in the Node.js backend to execute user code directly on the host machine. ALWAYS route execution through the Docker command.
3.  **Input Escaping:** When passing user code into the Docker command line, ensure quotes and special characters are heavily escaped to prevent command injection, or write the code to a temporary file, mount it to Docker, and execute the file.
4.  **Error Handling:** If Docker execution fails (e.g., SyntaxError in user code, timeout), capture `stderr` and return a standard `200 OK` with `{ status: "error", output: "..." }` so the frontend can display the stack trace beautifully. Do not crash the Express server.
5.  **CORS Configuration:** Ensure the backend explicitly whitelists the frontend's deployed URL to avoid browser CORS policy blocks.