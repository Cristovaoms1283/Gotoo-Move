import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getUserSubscriptionStatus, getActiveProgram } from "@/lib/data";
import Link from "next/link";
import BuyOneOffButton from "@/components/BuyOneOffButton";
import { syncUser } from "@/app/actions/user";
import { rotateUserProgram } from "@/app/actions/programs";
import { redirect } from "next/navigation";
import { InstallPWA } from "@/components/InstallPWA";
import { DashboardCard } from "@/components/DashboardCard";

const HUB_OPTIONS = [
  {
    title: "Meu Treino",
    description: "Acesse seu programa personalizado e fichas de musculação.",
    iconName: "Dumbbell",
    href: "/dashboard/workouts?type=gym",
    color: "from-primary to-primary-foreground",
    delay: 0.1
  },
  {
    title: "Treino HIIT",
    description: "Aulas rápidas em casa, sem equipamento.",
    iconName: "Flame",
    href: "/treino-em-casa",
    color: "from-orange-500 to-red-500",
    delay: 0.2
  },
  {
    title: "Corrida",
    description: "Planilhas e periodização para sua evolução no asfalto.",
    iconName: "Footprints",
    href: "/dashboard/workouts?type=running",
    color: "from-green-500 to-emerald-500",
    delay: 0.3
  },
  {
    title: "Dicas de Treino",
    description: "Técnicas, respiração e como evitar lesões.",
    iconName: "Lightbulb",
    href: "/dashboard/tips",
    color: "from-yellow-500 to-orange-500",
    delay: 0.4
  },
  {
    title: "Alimentação",
    description: "Dicas nutricionais para potencializar seu resultado.",
    iconName: "Apple",
    href: "/dashboard/nutrition",
    color: "from-green-400 to-emerald-400",
    delay: 0.5
  },
  {
    title: "Receitas Fitness",
    description: "Pratos saudáveis e saborosos para sua dieta.",
    iconName: "UtensilsCrossed",
    href: "/dashboard/recipes",
    color: "from-red-500 to-pink-500",
    delay: 0.6
  },
  {
    title: "Recompensas",
    description: "Troque suas FitCoins por brindes e benefícios exclusivos.",
    iconName: "Trophy",
    href: "/dashboard/rewards",
    color: "from-primary to-orange-500",
    delay: 0.7
  }
];

export default async function DashboardHubPage() {
  try {
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
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <InstallPWA forceVisible={true} />
              </div>
              <div className="scale-125">
                <UserButton />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {dynamicOptions.map((option) => (
              <DashboardCard
                key={option.title}
                title={option.title}
                description={option.description}
                iconName={option.iconName}
                href={option.href}
                isLocked={option.isLocked}
              />
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
  } catch (error: any) {
    console.error("DASHBOARD_CRITICAL_ERROR:", error);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erro ao carregar seu dashboard</h1>
          <p className="text-white/60 mb-6">Estamos com uma instabilidade temporária. Por favor, tente novamente em alguns instantes.</p>
          <div className="p-4 bg-zinc-900 rounded-lg text-left text-xs font-mono text-red-400 overflow-auto max-h-40">
            {error.message || "Erro desconhecido"}
          </div>
          <Link href="/" className="mt-8 inline-block text-primary hover:underline">Voltar para Home</Link>
        </div>
      </div>
    );
  }
}
