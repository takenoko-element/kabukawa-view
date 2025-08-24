// front/app/page.tsx
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="text-2xl font-bold p-4">KABUKAWA View</h1>
      <Dashboard />
    </main>
  );
}
