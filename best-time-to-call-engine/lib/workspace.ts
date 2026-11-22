import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE = "ws";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Read only: the workspace id if this browser has a valid cookie, else null.
// Safe to call while a page renders, because it never sets a cookie.
export async function getWorkspaceId() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;

  // The cookie comes from the browser, so check it before it reaches the database.
  return id && UUID.test(id) ? id : null;
}

// Gives each browser its own anonymous workspace id, so lists don't mix.
// Cookies can only be set in server actions and route handlers, so call this there.
export async function getOrCreateWorkspaceId() {
  const existing = await getWorkspaceId();
  if (existing) return existing;

  const id = randomUUID();
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}
