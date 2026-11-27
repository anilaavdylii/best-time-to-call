import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE = "ws";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getWorkspaceId() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;

  return id && UUID.test(id) ? id : null;
}

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
