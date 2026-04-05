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
import { redirect } from "next/navigation";

const HUB_OPTIONS = [
  {
    title: "Meu Treino",
    description: "Acesse seu programa personalizado e vídeos demonstrativos.",
    icon: Dumbbell,
    href: "/dashboard/workouts",
    color: "from-primary to-primary-foreground",
    delay: 0.1
  },
  {
    title: "Dicas de Treino",
    description: "Técnicas, respiração e como evitar lesões.",
    icon: Lightbulb,
    href: "/dashboard/tips",
    color: "from-yellow-500 to-orange-500",
    delay: 0.2
  },
  {
    title: "Alimentação",
    description: "Dicas nutricionais para potencializar seu resultado.",
    icon: Apple,
    href: "/dashboard/nutrition",
    color: "from-green-500 to-emerald-500",
    delay: 0.3
  },
  {
    title: "Receitas Fitness",
    description: "Pratos saudáveis e saborosos para sua dieta.",
    icon: UtensilsCrossed,
    href: "/dashboard/recipes",
    color: "from-red-500 to-pink-500",
    delay: 0.4
  },
  {
    title: "Treino HIIT",
    description: "Aulas rápidas em casa, sem equipamento.",
    icon: Flame,
    href: "/treino-em-casa",
    color: "from-orange-500 to-red-500",
    delay: 0.5
  },
  {
    title: "Recompensas",
    description: "Troque suas FitCoins por brindes e benefícios exclusivos.",
    icon: Trophy,
    href: "/dashboard/rewards",
    color: "from-primary to-orange-500",
    delay: 0.6
  }
];

import { getRunningWorkoutSchedule, calculateCurrentWeek } from "@/lib/running-logic";
import { Footprints } from "lucide-react";

export default async function DashboardHubPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await syncUser();
  
  if (!dbUser?.whatsapp || !dbUser?.goal) {
    redirect("/dashboard/onboarding");
  }

  const { id: dbUserId, status, goal, isGuest } = await getUserSubscriptionStatus(clerkUser.id);
  const activeProgram = dbUserId ? await getActiveProgram(dbUserId) : null;

  // Lógica de Periodização de Corrida
  const isRunner = activeProgram?.category === "RUNNING";
  const currentWeek = isRunner && activeProgram ? calculateCurrentWeek(activeProgram.createdAt) : 1;
  const todayWorkout = isRunner ? getRunningWorkoutSchedule(new Date(), currentWeek) : null;

  const dynamicOptions = [
    {
      title: todayWorkout?.type === "RUNNING" ? "Minha Corrida" : todayWorkout?.type === "STRENGTH" ? "Fortalecimento" : "Meu Treino",
      description: todayWorkout 
        ? `${todayWorkout.title}: ${todayWorkout.description} (Semana ${currentWeek} - ${todayWorkout.phase})`
        : "Acesse seu programa personalizado e vídeos demonstrativos.",
      icon: todayWorkout?.type === "RUNNING" ? Footprints : Dumbbell,
      href: "/dashboard/workouts",
      color: todayWorkout?.type === "RUNNING" ? "from-green-500 to-emerald-500" : "from-primary to-primary-foreground",
      delay: 0.1
    },
    {
      title: "Dicas de Treino",
      description: isRunner ? "Estratégias de pace, respiração e posturas de corrida." : "Técnicas, respiração e como evitar lesões.",
      icon: Lightbulb,
      href: "/dashboard/tips",
      color: "from-yellow-500 to-orange-500",
      delay: 0.2
    },
    ...HUB_OPTIONS.slice(2)
  ];

  if (status !== "active" && !isGuest && process.env.NODE_ENV === "production") {
    // ... render restrito ...
  }

  return (
    <main className="min-h-screen pt-32 pb-12 bg-black overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-2 uppercase">
              BEM-VINDO, <span className="text-primary italic">{clerkUser?.firstName}</span>!
            </h1>
            <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-wider ${isRunner ? 'bg-green-500 text-black' : 'bg-primary text-black'}`}>
                    Foco: {goal || 'Geral'}
                </span>
                {activeProgram && (
                  <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-wider border border-white/5">
                    {activeProgram.category === "RUNNING" ? `Planilha: ${activeProgram.subcategory}` : `Programa: ${activeProgram.title}`}
                  </span>
                )}
                {isRunner && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-wider border border-white/5">
                    Semana {currentWeek} / 52
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
              href={option.href}
              className="group relative"
            >
                <div className="relative glass p-8 rounded-[40px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-start gap-4 overflow-hidden h-full">
                    {/* Hover Glow */}
                    <div className={`absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                    
                    <div className="p-4 rounded-2xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                        <option.icon className="h-8 w-8" />
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight mb-2 flex items-center gap-2">
                            {option.title}
                            <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                        </h2>
                        <p className="text-white/40 leading-relaxed text-sm max-w-[280px]">
                            {option.description}
                        </p>
                    </div>

                    <div className="mt-auto pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors">
                            Acessar Conteúdo
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
