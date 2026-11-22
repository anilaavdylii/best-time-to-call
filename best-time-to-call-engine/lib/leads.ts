import { getWorkspaceId } from "./workspace";
import { countLeadsByState } from "@/db/contacts";

// For server components: this browser's lead counts per state.
// A browser with no cookie yet has no leads.
export async function getLeadsByState(): Promise<Record<string, number>> {
  const workspaceId = await getWorkspaceId();
  return workspaceId ? countLeadsByState(workspaceId) : {};
}
