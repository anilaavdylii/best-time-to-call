"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateWorkspaceId } from "@/lib/workspace";
import { parsePhoneLines, type ImportResult } from "@/lib/phone";
import { saveContacts } from "@/db/contacts";

export async function importNumbers(text: string): Promise<ImportResult> {
  if (typeof text !== "string" || text.length > 200_000) {
    return {
      added: 0,
      alreadySaved: 0,
      repeated: 0,
      invalid: [{ line: 0, raw: "", reason: "That input is too large." }],
    };
  }

  const { valid, invalid, repeated } = parsePhoneLines(text);
  if (valid.length === 0)
    return { added: 0, alreadySaved: 0, repeated, invalid };

  const workspaceId = await getOrCreateWorkspaceId();
  const added = await saveContacts(workspaceId, valid);

  if (added > 0) revalidatePath("/");

  return { added, alreadySaved: valid.length - added, repeated, invalid };
}
