import { checkAdmin } from "@/lib/admin";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex overflow-hidden">
      {/* Sidebar Simples */}
      <aside className="w-64 border-r border-zinc-800 p-6 min-h-screen sticky top-0 bg-zinc-950 z-20 overflow-y-auto">
        <div className="mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
          <h2 className="text-xl font-bold text-orange-500">Gotoo Move Admin</h2>
        </div>
        <nav className="space-y-4">
          <Link href="/admin" className="block p-2 hover:bg-zinc-900 rounded transition">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block p-2 hover:bg-zinc-900 rounded transition">
            Gerenciar Alunos
          </Link>
          <Link href="/admin/workouts" className="block p-2 hover:bg-zinc-900 rounded transition">
            Fichas de Treino
          </Link>
          <Link href="/admin/programs" className="block p-2 hover:bg-zinc-900 rounded transition font-bold text-orange-400">
            Programas (30 dias)
          </Link>
          <Link href="/admin/home-workouts" className="block p-2 hover:bg-zinc-900 rounded transition font-bold text-blue-400">
            Treinos em Casa
          </Link>
          <Link href="/admin/tips" className="block p-2 hover:bg-zinc-900 rounded transition">
            Dicas de Treino
          </Link>
          <Link href="/admin/nutrition" className="block p-2 hover:bg-zinc-900 rounded transition">
            Alimentação
          </Link>
          <Link href="/admin/recipes" className="block p-2 hover:bg-zinc-900 rounded transition">
            Receitas Fitness
          </Link>
          <Link href="/" className="block p-2 text-zinc-500 hover:text-white transition">
            Voltar ao Site
          </Link>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
