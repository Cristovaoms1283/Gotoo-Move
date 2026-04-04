import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, Lightbulb, Clock, Dumbbell, Home } from "lucide-react";
import Link from "next/link";

export default async function TipsPage() {
  const user = await currentUser();
  const tips = await prisma.tip.findMany({
    orderBy: { createdAt: "desc" },
  });

  const musculacao = tips.filter((t) => t.category === "musculacao");
  const casa = tips.filter((t) => t.category === "casa");

  const TipCard = ({ tip }: { tip: (typeof tips)[0] }) => (
    <div className="glass p-8 rounded-[30px] border border-white/5 hover:bg-white/[0.05] transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${tip.category === "musculacao" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>
          <Lightbulb className="h-5 w-5" />
        </div>
        <span className={`text-xs uppercase font-black tracking-widest ${tip.category === "musculacao" ? "text-orange-400/70" : "text-blue-400/70"}`}>
          {tip.category === "musculacao" ? "Musculação" : "Treino em Casa"}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-4 uppercase italic tracking-tight">{tip.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
        {tip.content}
      </p>
      <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold">
        <Clock className="h-3 w-3" />
        Adicionado em {tip.createdAt.toLocaleDateString("pt-BR")}
      </div>
    </div>
  );

  const isEmpty = tips.length === 0;

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
              DICAS DE <span className="text-primary">TREINO</span>
            </h1>
          </div>
          <UserButton />
        </header>

        {isEmpty ? (
          <div className="glass p-12 rounded-[40px] text-center max-w-2xl mx-auto">
            <Lightbulb className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Em breve!</h2>
            <p className="text-white/60 mb-8">
              Estamos preparando os melhores materiais de técnica e performance para você.
            </p>
          </div>
        ) : (
          <div className="space-y-14">

            {/* === MUSCULAÇÃO === */}
            {musculacao.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-orange-500/20 rounded-2xl">
                    <Dumbbell className="h-7 w-7 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-orange-400/70 text-xs font-black uppercase tracking-widest mb-0.5">Categoria</p>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight">
                      MUSCULAÇÃO / <span className="text-orange-400">ACADEMIA</span>
                    </h2>
                  </div>
                  <span className="ml-auto text-sm text-white/30 font-bold">{musculacao.length} dicas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {musculacao.map((tip) => (
                    <TipCard key={tip.id} tip={tip} />
                  ))}
                </div>
              </section>
            )}

            {/* Divisor */}
            {musculacao.length > 0 && casa.length > 0 && (
              <div className="border-t border-white/5" />
            )}

            {/* === TREINO EM CASA === */}
            {casa.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Home className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400/70 text-xs font-black uppercase tracking-widest mb-0.5">Categoria</p>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight">
                      TREINO EM CASA / <span className="text-blue-400">FUNCIONAL</span>
                    </h2>
                  </div>
                  <span className="ml-auto text-sm text-white/30 font-bold">{casa.length} dicas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {casa.map((tip) => (
                    <TipCard key={tip.id} tip={tip} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
