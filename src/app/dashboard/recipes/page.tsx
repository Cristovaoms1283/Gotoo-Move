import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, UtensilsCrossed, Zap, Flame, Salad, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function RecipesPage() {
  const user = await currentUser();
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  const preTreino = recipes.filter(r => r.category === 'pre-treino');
  const lowCarb = recipes.filter(r => r.category === 'low-carb');

  const RecipeGrid = ({ title, items, icon: Icon, colorClass, borderClass, bgColorClass, label }: any) => (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-10">
        <div className={`p-4 ${bgColorClass} rounded-[20px] shadow-lg shadow-white/5`}>
          <Icon className={`h-8 w-8 ${colorClass} animate-pulse`} />
        </div>
        <div>
          <span className={`${colorClass} text-[10px] font-black uppercase tracking-[0.3em]`}>{label}</span>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{title}</h2>
        </div>
        <div className="flex-1 h-px bg-white/5 ml-4" />
        <span className="text-white/20 font-black italic text-4xl">{items.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((recipe: any) => (
          <div key={recipe.id} className="glass rounded-[40px] overflow-hidden border border-white/5 flex flex-col group hover:border-white/20 transition-all duration-500">
            {recipe.imageUrl ? (
                <div className="relative h-64 overflow-hidden">
                    <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                    <div className={`absolute top-4 left-4 px-3 py-1 ${bgColorClass} ${colorClass} backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10`}>
                        {label}
                    </div>
                </div>
            ) : (
                <div className="h-64 bg-zinc-900 flex items-center justify-center text-primary/10">
                    <UtensilsCrossed className="h-24 w-24" />
                </div>
            )}
            
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{recipe.title}</h3>
              
              <div className="flex gap-4 mb-8">
                {recipe.calories && (
                    <div className="flex items-center gap-1.5 text-white/40 font-bold text-[10px] uppercase bg-white/5 px-2.5 py-1 rounded-lg">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        {recipe.calories} kcal
                    </div>
                )}
                <div className="flex items-center gap-1.5 text-white/40 font-bold text-[10px] uppercase bg-white/5 px-2.5 py-1 rounded-lg">
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    Alta Densidade
                </div>
              </div>

              <div className="space-y-4 mb-10 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-4 bg-primary rounded-full" />
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ingredientes</h4>
                </div>
                <p className="text-white/50 text-xs leading-relaxed italic whitespace-pre-wrap line-clamp-2 pl-6 border-l border-white/5">
                    {recipe.ingredients}
                </p>
              </div>

              <Link 
                href={`/dashboard/recipes/${recipe.id}`} 
                className={`mt-auto btn-premium ${colorClass.includes('yellow') ? 'btn-primary' : 'bg-green-600 hover:bg-green-500 text-white'} !py-3 !text-xs w-full flex items-center justify-center gap-2 group/btn`}
              >
                VER RECEITA COMPLETA
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pt-24 pb-20 bg-black">
      <div className="container mx-auto px-6">
        <header className="flex items-center justify-between mb-20">
          <div className="relative">
            <Link href="/dashboard" className="text-primary hover:text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-4 group w-fit">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              RETORNAR AO HUB
            </Link>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white/5 absolute -top-12 -left-4 pointer-events-none select-none">
              GASTRONOMIA
            </h1>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter relative">
              RECEITAS <span className="text-primary">FITNESS</span>
            </h2>
          </div>
          <div className="glass p-2 rounded-full border border-white/10">
            <UserButton />
          </div>
        </header>

        {recipes.length === 0 ? (
          <div className="glass p-20 rounded-[60px] text-center max-w-4xl mx-auto border border-white/5">
            <div className="relative inline-block mb-10">
                <UtensilsCrossed className="h-24 w-24 text-primary" />
                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Menu Degustação em breve!</h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-xl mx-auto">
              Nossa equipe de nutrição está finalizando preparos exclusivos para otimizar seus resultados.
            </p>
          </div>
        ) : (
          <div className="space-y-24">
            <RecipeGrid 
                title="Combustível Pré-Treino" 
                label="MÁXIMA ENERGIA"
                items={preTreino} 
                icon={Zap} 
                colorClass="text-yellow-400" 
                bgColorClass="bg-yellow-400/10" 
            />

            <RecipeGrid 
                title="Principais Low Carb" 
                label="PROTEÍNA & SAÚDE"
                items={lowCarb} 
                icon={Salad} 
                colorClass="text-green-400" 
                bgColorClass="bg-green-400/10" 
            />
          </div>
        )}
      </div>
    </main>
  );
}
