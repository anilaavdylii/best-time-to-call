import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE = "ws";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Gives each browser its own anonymous workspace id, so lists don't mix.
// Cookies can only be set in server actions and route handlers, so call this there.
export async function getOrCreateWorkspaceId() {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;

  // The cookie comes from the browser, so check it before it reaches the database.
  if (existing && UUID.test(existing)) return existing;

  const id = randomUUID();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}
