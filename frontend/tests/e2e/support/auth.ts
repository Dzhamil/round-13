import { createHmac } from "node:crypto";
import type { Page } from "@playwright/test";
import { QA_USERS, type QaRole } from "./apiFixtures";

type JwtPayload = {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
    typ: "access";
    roles: string[];
};

const DEFAULT_SECRET = "round13-local-qa-secret-32-chars-minimum";

function base64Url(value: string): string {
    return Buffer.from(value)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function signJwt(payload: JwtPayload): string {
    const secret = process.env.APP_JWT_SECRET?.trim() || DEFAULT_SECRET;
    const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64Url(JSON.stringify(payload));
    const signature = createHmac("sha256", secret)
        .update(`${header}.${body}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${header}.${body}.${signature}`;
}

function roleClaim(role: QaRole): string {
    return `ROLE_${QA_USERS[role].role}`;
}

export function createAccessToken(role: QaRole): string {
    const now = Math.floor(Date.now() / 1000);

    return signJwt({
        iss: process.env.APP_JWT_ISSUER?.trim() || "round13",
        sub: QA_USERS[role].id,
        iat: now,
        exp: now + 60 * 60,
        typ: "access",
        roles: [roleClaim(role)],
    });
}

export async function authAs(page: Page, role: QaRole): Promise<void> {
    const accessToken = createAccessToken(role);
    const refreshToken = `qa-refresh-token-${role}`;

    await page.addInitScript(
        ({ accessToken: token, refreshToken: refresh }) => {
            window.localStorage.setItem("accessToken", token);
            window.localStorage.setItem("refreshToken", refresh);
        },
        { accessToken, refreshToken },
    );
}
