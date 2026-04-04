import prisma from "@/lib/db";
import Link from "next/link";
import { Plus, Trash2, Utensils, Zap, Salad } from "lucide-react";
import { deleteRecipe } from "@/app/actions/admin";

export default async function AdminRecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  const preTreino = recipes.filter(r => r.category === 'pre-treino');
  const lowCarb = recipes.filter(r => r.category === 'low-carb');

  const RecipeSection = ({ title, items, icon: Icon, colorClass, bgColorClass }: any) => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 ${bgColorClass} rounded-lg`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-zinc-500 text-sm font-medium bg-zinc-800 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500">Nenhuma receita nesta categoria.</p>
          </div>
        ) : (
          items.map((recipe: any) => (
            <div key={recipe.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-zinc-700 transition-colors group">
              <div className="relative">
                {recipe.imageUrl ? (
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-zinc-800 flex items-center justify-center text-zinc-600">
                    <Utensils className="h-10 w-10" />
                  </div>
                )}
                <form action={deleteRecipe.bind(null, recipe.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-black/60 backdrop-blur-md p-2 rounded-full text-zinc-400 hover:text-red-500 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-2">{recipe.title}</h3>
                <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-1">{recipe.instructions}</p>
                {recipe.calories && (
                  <div className={`text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
                    {recipe.calories} kcal
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Receitas</h1>
        <Link 
          href="/admin/recipes/new" 
          className="bg-primary text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition"
        >
          <Plus className="h-5 w-5" />
          Nova Receita
        </Link>
      </div>

      <RecipeSection 
        title="Energia Pré-Treino" 
        items={preTreino} 
        icon={Zap} 
        colorClass="text-yellow-500" 
        bgColorClass="bg-yellow-500/10" 
      />

      <RecipeSection 
        title="Refeições Low Carb" 
        items={lowCarb} 
        icon={Salad} 
        colorClass="text-green-500" 
        bgColorClass="bg-green-500/10" 
      />
    </div>
  );
}
