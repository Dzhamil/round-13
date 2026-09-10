import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

function buildRelease(): string {
    try {
        return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {
        // Container build contexts can exclude .git; still identify the deployed bundle.
        return `build-${Date.now()}`;
    }
}

const HOST = "localhost.127.0.0.1.nip.io";
const useHttps = process.env.VITE_DEV_HTTPS !== "false";

export default defineConfig({
    plugins: [react()],
    define: { "import.meta.env.VITE_RELEASE": JSON.stringify(buildRelease()) },
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
