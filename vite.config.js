import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import fs from "fs";
import path from "path";

// Simple Vite plugin to handle local file uploads during development
const mockUploadPlugin = () => ({
  name: 'mock-upload',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/upload-leave-proof' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const { filename, fileData } = data;
            
            // Extract base64 content
            const base64Data = fileData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
            const ext = path.extname(filename);
            const baseName = path.basename(filename, ext);
            const uniqueFilename = `${baseName}-${Date.now()}${ext}`;
            const targetPath = path.join(process.cwd(), 'public', 'storage', 'leave-proofs', uniqueFilename);
            
            fs.writeFileSync(targetPath, base64Data, 'base64');
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              filePath: `/storage/leave-proofs/${uniqueFilename}` 
            }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      } else {
        next();
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mockUploadPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
