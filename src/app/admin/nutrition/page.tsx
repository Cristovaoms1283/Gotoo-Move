import prisma from "@/lib/db";
import Link from "next/link";
import { Plus, Trash2, Clock, Leaf, BarChart2, Newspaper } from "lucide-react";
import { deleteNutrition } from "@/app/actions/admin";

const CATEGORIES = [
  {
    key: "horarios",
    label: "Horários e Timing",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
  },
  {
    key: "alimentos",
    label: "Alimentos x Treino",
    icon: Leaf,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  {
    key: "glicemico",
    label: "Índice Glicêmico",
    icon: BarChart2,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    key: "noticias",
    label: "Ciência & Notícias",
    icon: Newspaper,
    color: "text-sky-400",
    bg: "bg-sky-500/20",
  },
];

export default async function AdminNutritionPage() {
  const items = await prisma.nutrition.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Alimentação</h1>
        <Link
          href="/admin/nutrition/new"
          className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition"
        >
          <Plus className="h-5 w-5" />
          Nova Dica
        </Link>
      </div>

      <div className="space-y-8">
        {CATEGORIES.map(({ key, label, icon: Icon, color, bg }) => {
          const catItems = items.filter((i) => i.category === key);
          return (
            <div key={key} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${bg} rounded-lg`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h2 className="text-xl font-bold">{label}</h2>
                <span className="ml-auto text-sm text-zinc-500">{catItems.length} dicas</span>
              </div>

              {catItems.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4 text-center">Nenhuma dica nesta categoria.</p>
              ) : (
                <div className="space-y-3">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold truncate">{item.title}</h3>
                        <p className="text-zinc-400 text-sm line-clamp-1 mt-0.5">{item.content}</p>
                      </div>
                      <form action={deleteNutrition.bind(null, item.id)}>
                        <button className="p-2 text-zinc-500 hover:text-red-500 transition shrink-0">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
