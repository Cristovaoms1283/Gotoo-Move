import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, UtensilsCrossed, Flame, Clock, ChefHat } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RecipeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const recipe = await prisma.recipe.findUnique({
    where: { id },
  });

  if (!recipe) return notFound();

  return (
    <main className="min-h-screen pt-24 pb-12 bg-black">
      <div className="container mx-auto px-6">
        <header className="mb-12">
            <Link href="/dashboard/recipes" className="text-primary hover:underline text-xs flex items-center gap-1 mb-4 group">
              <ArrowRight className="h-3 w-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Voltar para Receitas
            </Link>
            <div className="flex items-center justify-between">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter max-w-2xl">
                    {recipe.title}
                </h1>
                <UserButton />
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
                {recipe.imageUrl && (
                    <div className="glass rounded-[40px] overflow-hidden border border-white/5">
                        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-auto" />
                    </div>
                )}
                
                <div className="glass p-8 rounded-[40px] border border-white/5">
                    <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 text-primary">
                        <ChefHat className="h-5 w-5" />
                        Ingredientes
                    </h2>
                    <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                        {recipe.ingredients}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-[30px] border border-white/5 flex flex-col items-center">
                        <Flame className="h-8 w-8 text-orange-500 mb-2" />
                        <span className="text-2xl font-black italic">{recipe.calories || 'N/A'}</span>
                        <span className="text-[10px] uppercase font-bold text-white/30">Calorias (kcal)</span>
                    </div>
                    <div className="glass p-6 rounded-[30px] border border-white/5 flex flex-col items-center">
                        <Clock className="h-8 w-8 text-primary mb-2" />
                        <span className="text-2xl font-black italic">PRÁTICA</span>
                        <span className="text-[10px] uppercase font-bold text-white/30">Complexidade</span>
                    </div>
                </div>

                <div className="glass p-10 rounded-[40px] border border-white/5 bg-primary/5">
                    <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 text-primary">
                        <UtensilsCrossed className="h-5 w-5" />
                        Modo de Preparo
                    </h2>
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
                        {recipe.instructions}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
