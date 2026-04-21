import { checkAdmin } from "@/lib/admin";
import { AdminSidebar } from "./components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex overflow-hidden pt-[72px]">
      <AdminSidebar />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10 bg-zinc-950 w-full">
        <div className="max-w-7xl mx-auto mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
