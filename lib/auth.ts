import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAccountById } from "./db";
import { Account, UserMode } from "./types";
import { randomBytes } from "crypto";

const SESSION_COOKIE_NAME = "vn_session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Secret key for JWT signing
const rawSecret =
  process.env.SESSION_SECRET ||
  "vynter-north-fallback-session-secret-key-32chars-minimum!!";
const JWT_SECRET = new TextEncoder().encode(rawSecret);

// ═══════════════════════════════════════════════════════════
// PASSWORD & RECOVERY CODE UTILITIES
// ═══════════════════════════════════════════════════════════

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a memorable 16-character recovery code in XXXX-XXXX-XXXX-XXXX format
 */
export function generateRecoveryCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes ambiguous 0, O, 1, I
  const randomValues = randomBytes(16);
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars[randomValues[i] % chars.length];
    if (i % 4 === 3 && i < 15) {
      code += "-";
    }
  }
  return code;
}

export async function hashRecoveryCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(normalized, salt);
}

export async function verifyRecoveryCode(
  code: string,
  hash: string
): Promise<boolean> {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return bcrypt.compare(normalized, hash);
}

// ═══════════════════════════════════════════════════════════
// SESSION TOKENS (JWT via jose)
// ═══════════════════════════════════════════════════════════

export async function createSessionToken(accountId: string): Promise<string> {
  return new SignJWT({ accountId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<{ accountId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.accountId && typeof payload.accountId === "string") {
      return { accountId: payload.accountId };
    }
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// COOKIE ACCESS & CURRENT USER
// ═══════════════════════════════════════════════════════════

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<Account | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.accountId) return null;

    return await getAccountById(payload.accountId);
  } catch (err) {
    console.warn("getSession error:", err);
    return null;
  }
}

export async function requireAccount(): Promise<Account> {
  const account = await getSession();
  if (!account) {
    throw new Error("UNAUTHORIZED");
  }
  return account;
}

export async function requireMode(mode: UserMode): Promise<Account> {
  const account = await requireAccount();
  if (mode === "creator" && !account.has_creator) {
    throw new Error("FORBIDDEN_CREATOR_ROLE_REQUIRED");
  }
  if (mode === "studio" && !account.has_studio) {
    throw new Error("FORBIDDEN_STUDIO_ROLE_REQUIRED");
  }
  return account;
}

export function isAdmin(account: Account | null): boolean {
  if (!account) return false;
  const adminList = (process.env.ADMIN_USERNAMES || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminList.includes(account.username.toLowerCase());
}
