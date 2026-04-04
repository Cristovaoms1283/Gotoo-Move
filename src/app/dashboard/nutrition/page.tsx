import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, Apple, Clock, Leaf, BarChart2, Newspaper } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  {
    key: "horarios",
    label: "Horários e Timing de Refeições",
    accent: "TIMING",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/20",
  },
  {
    key: "alimentos",
    label: "Impacto dos Alimentos no Treino",
    accent: "ALIMENTOS",
    icon: Leaf,
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/20",
  },
  {
    key: "glicemico",
    label: "Índice Glicêmico e Saúde",
    accent: "ÍNDICE GLICÊMICO",
    icon: BarChart2,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/20",
  },
  {
    key: "noticias",
    label: "Ciência e Notícias sobre Nutrição",
    accent: "CIÊNCIA",
    icon: Newspaper,
    color: "text-sky-400",
    bg: "bg-sky-500/20",
    border: "border-sky-500/20",
  },
];

export default async function NutritionPage() {
  const user = await currentUser();
  const guides = await prisma.nutrition.findMany({
    orderBy: { createdAt: "desc" },
  });

  const isEmpty = guides.length === 0;

  return (
    <main className="min-h-screen pt-24 pb-12 bg-black">
      <div className="container mx-auto px-6">
        <header className="flex items-center justify-between mb-12">
          <div>
            <Link href="/dashboard" className="text-primary hover:underline text-xs flex items-center gap-1 mb-2 group">
              <ArrowRight className="h-3 w-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Hub
            </Link>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              DICAS DE <span className="text-primary">ALIMENTAÇÃO</span>
            </h1>
          </div>
          <UserButton />
        </header>

        {isEmpty ? (
          <div className="glass p-12 rounded-[40px] text-center max-w-2xl mx-auto">
            <Apple className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Cozinha em Preparo!</h2>
            <p className="text-white/60 mb-8">
              Nossos guias nutricionais estão sendo finalizados para te ajudar.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {CATEGORIES.map(({ key, label, accent, icon: Icon, color, bg, border }, idx) => {
              const catGuides = guides.filter((g) => g.category === key);
              if (catGuides.length === 0) return null;

              return (
                <section key={key}>
                  {/* Divisor entre seções */}
                  {idx > 0 && <div className="border-t border-white/5 mb-14" />}

                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 ${bg} rounded-2xl`}>
                      <Icon className={`h-7 w-7 ${color}`} />
                    </div>
                    <div>
                      <p className={`${color} opacity-70 text-xs font-black uppercase tracking-widest mb-0.5`}>
                        Categoria
                      </p>
                      <h2 className="text-2xl font-black italic uppercase tracking-tight">
                        {label.split(" ").slice(0, -1).join(" ")}{" "}
                        <span className={color}>{label.split(" ").slice(-1)}</span>
                      </h2>
                    </div>
                    <span className="ml-auto text-sm text-white/30 font-bold">{catGuides.length} dicas</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {catGuides.map((guide) => (
                      <div
                        key={guide.id}
                        className={`glass p-8 rounded-[30px] border ${border} hover:bg-white/[0.05] transition-all`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 ${bg} rounded-lg`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>
                          <span className={`text-xs uppercase font-black tracking-widest ${color} opacity-70`}>
                            {accent}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-4 uppercase italic tracking-tight">
                          {guide.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                          {guide.content}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold">
                          <Clock className="h-3 w-3" />
                          Publicado em {guide.createdAt.toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
