#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(scriptDir, "seed-regression.sql");
const defaultPasswordHash = "$2y$10$5u4cu9rPmaMCDFQvawPZ2.EmU4YWmhxkWBP6gAcIfyFn5Mo/Mz.T2";

function jdbcToPsqlUrl(jdbcUrl) {
    if (!jdbcUrl?.startsWith("jdbc:postgresql://")) {
        return "";
    }

    return jdbcUrl.replace(/^jdbc:/, "");
}

function resolveDatabaseUrl() {
    return process.env.QA_DATABASE_URL?.trim()
        || process.env.DATABASE_URL?.trim()
        || jdbcToPsqlUrl(process.env.SPRING_DATASOURCE_URL?.trim());
}

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) {
    console.error("Set QA_DATABASE_URL, DATABASE_URL, or SPRING_DATASOURCE_URL before running qa:seed.");
    process.exit(2);
}

if (!existsSync(seedPath)) {
    console.error(`Seed file not found: ${seedPath}`);
    process.exit(2);
}

const passwordHash = process.env.BOOTSTRAP_PANEL_ADMIN_PASSWORD_HASH?.trim() || defaultPasswordHash;
const env = {
    ...process.env,
};

if (!env.PGPASSWORD && process.env.SPRING_DATASOURCE_PASSWORD) {
    env.PGPASSWORD = process.env.SPRING_DATASOURCE_PASSWORD;
}

const args = [
    databaseUrl,
    "-v",
    "ON_ERROR_STOP=1",
    "-v",
    `qa_panel_password_hash=${passwordHash}`,
    "-f",
    seedPath,
];

const result = spawnSync("psql", args, {
    stdio: "inherit",
    env,
});

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

process.exit(result.status ?? 1);
