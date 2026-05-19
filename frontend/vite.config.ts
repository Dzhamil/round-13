import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

const HOST = process.env.VITE_DEV_HOST?.trim() || "localhost.127.0.0.1.nip.io";
const PORT = Number(process.env.VITE_DEV_PORT?.trim() || "5173");
const API_PROXY_TARGET = process.env.VITE_DEV_API_PROXY_TARGET?.trim() || "http://127.0.0.1:8080";
const USE_HTTPS = process.env.VITE_DEV_HTTPS?.trim() !== "false";

export default defineConfig({
    plugins: [react()],
    server: {
        host: HOST,
        port: PORT,
        strictPort: true,
        https: USE_HTTPS
            ? {
                key: fs.readFileSync("./localhost.127.0.0.1.nip.io-key.pem"),
                cert: fs.readFileSync("./localhost.127.0.0.1.nip.io.pem"),
            }
            : undefined,
        proxy: {
            "/api": {
                target: API_PROXY_TARGET,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
