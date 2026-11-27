import CallingWorkspaceLayout from "@/components/CallingWorkspaceLayout";
import Header from "@/components/Header";
import { getLeadsByState } from "@/lib/leads";
import { Suspense } from "react";

async function Workspace() {
  const leadsByState = await getLeadsByState();

  return <CallingWorkspaceLayout leadsByState={leadsByState} />;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <Header />
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <Workspace />
        </Suspense>
      </div>
    </main>
  );
}
