import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

const HOST = "localhost.127.0.0.1.nip.io";
const useHttps = process.env.VITE_DEV_HTTPS !== "false";

export default defineConfig({
    plugins: [react()],
    server: {
        host: HOST,
        port: 5173,
        https: useHttps
            ? {
                key: fs.readFileSync("./localhost.127.0.0.1.nip.io-key.pem"),
                cert: fs.readFileSync("./localhost.127.0.0.1.nip.io.pem"),
            }
            : undefined,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8080",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
