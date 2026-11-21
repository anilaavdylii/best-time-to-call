import CallingWorkspaceLayout from "@/components/CallingWorkspaceLayout";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <Header />
        <CallingWorkspaceLayout />
      </div>
    </main>
  );
}
