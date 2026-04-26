import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { 
  Dumbbell, 
  Lightbulb, 
  Apple, 
  UtensilsCrossed, 
  ArrowRight,
  Lock,
  Flame,
  Trophy
} from "lucide-react";
import { getUserSubscriptionStatus, getActiveProgram } from "@/lib/data";
import Link from "next/link";
import BuyOneOffButton from "@/components/BuyOneOffButton";
import { syncUser } from "@/app/actions/user";
import { rotateUserProgram } from "@/app/actions/programs";
import { redirect } from "next/navigation";

const HUB_OPTIONS = [
  {
    title: "Meu Treino",
    description: "Acesse seu programa personalizado e fichas de musculação.",
    icon: Dumbbell,
    href: "/dashboard/workouts?type=gym",
    color: "from-primary to-primary-foreground",
    delay: 0.1
  },
  {
    title: "Treino HIIT",
    description: "Aulas rápidas em casa, sem equipamento.",
    icon: Flame,
    href: "/treino-em-casa",
    color: "from-orange-500 to-red-500",
    delay: 0.2
  },
  {
    title: "Corrida",
    description: "Planilhas e periodização para sua evolução no asfalto.",
    icon: Footprints,
    href: "/dashboard/workouts?type=running",
    color: "from-green-500 to-emerald-500",
    delay: 0.3
  },
  {
    title: "Dicas de Treino",
    description: "Técnicas, respiração e como evitar lesões.",
    icon: Lightbulb,
    href: "/dashboard/tips",
    color: "from-yellow-500 to-orange-500",
    delay: 0.4
  },
  {
    title: "Alimentação",
    description: "Dicas nutricionais para potencializar seu resultado.",
    icon: Apple,
    href: "/dashboard/nutrition",
    color: "from-green-400 to-emerald-400",
    delay: 0.5
  },
  {
    title: "Receitas Fitness",
    description: "Pratos saudáveis e saborosos para sua dieta.",
    icon: UtensilsCrossed,
    href: "/dashboard/recipes",
    color: "from-red-500 to-pink-500",
    delay: 0.6
  },
  {
    title: "Recompensas",
    description: "Troque suas FitCoins por brindes e benefícios exclusivos.",
    icon: Trophy,
    href: "/dashboard/rewards",
    color: "from-primary to-orange-500",
    delay: 0.7
  }
];

import { getRunningWorkoutSchedule, calculateCurrentWeek } from "@/lib/running-logic";
import { Footprints } from "lucide-react";

export default async function DashboardHubPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/sign-in");

  // Redireciona se perfil estiver incompleto
  if (!dbUser.goal || !dbUser.whatsapp) {
    redirect("/dashboard/onboarding");
  }

  // Lógica de Periodização Automática para Convidados (Baseada em tempo)
  if (dbUser.isGuest) {
    const daysSinceCreation = Math.floor((Date.now() - new Date(dbUser.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const expectedMonth = Math.min(12, Math.floor(daysSinceCreation / 30) + 1);

    if (dbUser.current_training_month < expectedMonth) {
      console.log(`[GUEST_ROTATION] Rotacionando convidado ${dbUser.email} para o mês ${expectedMonth}`);
      await rotateUserProgram(dbUser.id, expectedMonth);
    }
  }

  const { id: dbUserId, status, goal, isGuest, access } = await getUserSubscriptionStatus(clerkUser.id);
  const activeProgram = dbUserId ? await getActiveProgram(dbUserId) : null;

  // Lógica de Periodização de Corrida Mensal
  const isRunner = activeProgram?.category === "RUNNING";
  const currentMonth = dbUser?.current_training_month || 1;

  const dynamicOptions = HUB_OPTIONS.map((option) => {
    // Aplicar travas de acesso
    let isLocked = false;
    if (option.title === "Meu Treino") isLocked = !access?.canGym;
    if (option.title === "Treino HIIT") isLocked = !access?.canHIIT;
    if (option.title === "Corrida" || option.title.includes("Minha Corrida")) isLocked = !access?.canRunning;

    // Customizar o Card de Corrida se for corredor e tiver acesso
    if (option.title === "Corrida" && isRunner && activeProgram && !isLocked) {
      return {
        ...option,
        title: `Minha Corrida (Mês ${currentMonth})`,
        description: `Planilha ${activeProgram.subcategory}: ${activeProgram.description?.split(" | ")[0] || "Treino Ativo"}`,
        isLocked
      };
    }

    // Customizar Dicas
    if (option.title === "Dicas de Treino" && isRunner) {
      return {
        ...option,
        description: "Estratégias de pace, respiração e posturas de corrida.",
        isLocked
      };
    }

    return { ...option, isLocked };
  });

  return (
    <main className="min-h-screen pt-32 pb-12 bg-black overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2 uppercase">
              BEM-VINDO, <span className="text-primary italic">{clerkUser?.firstName}</span>!
            </h1>
            <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-wider ${isRunner ? 'bg-green-500 text-black' : 'bg-primary text-black'}`}>
                    Foco: {goal || 'Geral'}
                </span>
                {activeProgram && (
                  <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-wider border border-white/5">
                    {activeProgram.category === "RUNNING" ? `Planilha Mês ${currentMonth}` : `Programa: ${activeProgram.title}`}
                  </span>
                )}
            </div>
          </div>
          <div className="scale-125">
            <UserButton />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {dynamicOptions.map((option) => (
            <Link 
              key={option.title} 
              href={option.isLocked ? "#" : option.href}
              className={`group relative ${option.isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            >
                <div className={`relative glass p-6 sm:p-8 rounded-[40px] border border-white/5 bg-white/[0.02] ${!option.isLocked ? 'hover:bg-white/[0.05]' : 'pointer-events-none'} transition-all duration-500 flex flex-col items-start gap-4 overflow-hidden h-full`}>
                    {!option.isLocked && (
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    )}
                    
                    <div className={`p-4 rounded-2xl bg-white/5 ${option.isLocked ? 'text-white/20' : 'text-primary group-hover:bg-primary group-hover:text-black'} transition-all duration-500`}>
                        {option.isLocked ? <Lock className="h-8 w-8" /> : <option.icon className="h-8 w-8" />}
                    </div>
                    
                    <div>
                        <h2 className={`text-2xl font-black italic uppercase tracking-tight mb-2 flex items-center gap-2 ${option.isLocked ? 'text-white/40' : ''}`}>
                            {option.title}
                            {!option.isLocked && <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />}
                            {option.isLocked && <Lock className="h-4 w-4 ml-auto text-primary/40" />}
                        </h2>
                        <p className="text-white/40 leading-relaxed text-sm max-w-[280px]">
                            {option.isLocked ? "Conteúdo não disponível no seu plano atual." : option.description}
                        </p>
                    </div>

                    <div className="mt-auto pt-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${option.isLocked ? 'text-white/20' : 'text-primary/50 group-hover:text-primary'} transition-colors italic`}>
                            {option.isLocked ? "Fazer Upgrade" : "Acessar Conteúdo"}
                        </span>
                    </div>
                </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-center">
            <p className="text-white/20 text-xs uppercase tracking-[0.2em] font-medium">
                © 2026 Fit Connect — Excelência em Performance
            </p>
        </footer>
      </div>
    </main>
  );
}
