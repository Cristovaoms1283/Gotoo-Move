import prisma from "@/lib/db";
import Link from "next/link";
import { Plus, Trash2, Dumbbell, Home } from "lucide-react";
import { deleteTip } from "@/app/actions/admin";

export default async function AdminTipsPage() {
  const tips = await prisma.tip.findMany({
    orderBy: { createdAt: "desc" },
  });

  const musculacao = tips.filter((t) => t.category === "musculacao");
  const casa = tips.filter((t) => t.category === "casa");

  const CategoryBadge = ({ cat }: { cat: string }) =>
    cat === "musculacao" ? (
      <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
        <Dumbbell className="h-3 w-3" /> Musculação
      </span>
    ) : (
      <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
        <Home className="h-3 w-3" /> Treino em Casa
      </span>
    );

  const TipList = ({ items }: { items: typeof tips }) =>
    items.length === 0 ? (
      <p className="text-zinc-500 text-sm py-4 text-center">Nenhuma dica nesta categoria.</p>
    ) : (
      <div className="space-y-3">
        {items.map((tip) => (
          <div key={tip.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CategoryBadge cat={tip.category} />
              </div>
              <h3 className="text-base font-bold truncate">{tip.title}</h3>
              <p className="text-zinc-400 text-sm line-clamp-1 mt-0.5">{tip.content}</p>
            </div>
            <form action={deleteTip.bind(null, tip.id)}>
              <button className="p-2 text-zinc-500 hover:text-red-500 transition shrink-0">
                <Trash2 className="h-5 w-5" />
              </button>
            </form>
          </div>
        ))}
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dicas de Treino</h1>
        <Link
          href="/admin/tips/new"
          className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition"
        >
          <Plus className="h-5 w-5" />
          Nova Dica
        </Link>
      </div>

      <div className="space-y-8">
        {/* Musculação */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Dumbbell className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold">Musculação / Academia</h2>
            <span className="ml-auto text-sm text-zinc-500">{musculacao.length} dicas</span>
          </div>
          <TipList items={musculacao} />
        </div>

        {/* Treino em Casa */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Home className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">Treino em Casa / Funcional</h2>
            <span className="ml-auto text-sm text-zinc-500">{casa.length} dicas</span>
          </div>
          <TipList items={casa} />
        </div>
      </div>
    </div>
  );
}
