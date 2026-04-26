import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { PlayCircle, Clock, Award, Lock, ArrowRight, Calendar, Dumbbell } from "lucide-react";
import { getUserSubscriptionStatus, getActiveProgram, getExerciseLastLoads } from "@/lib/data";
import Link from "next/link";
import BuyOneOffButton from "@/components/BuyOneOffButton";
import WorkoutClientView from "@/components/WorkoutClientView";

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ sheet?: string; type?: string }>;
}) {
  const user = await currentUser();
  const { id: dbUserId, status, goal, isDeloadActive, access } = await getUserSubscriptionStatus(user?.id || "");
  const activeProgram = dbUserId ? await getActiveProgram(dbUserId) : null;
  const { sheet, type = "gym" } = await searchParams; // Default to 'gym'

  // Validar permissão específica por tipo
  const hasAccessToType = type === 'running' ? access?.canRunning : access?.canGym;

  if ((status !== "active" || !hasAccessToType) && process.env.NODE_ENV === "production") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="glass p-12 rounded-3xl max-w-md text-center">
          <Lock className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-4 uppercase italic">Acesso Restrito</h1>
          <p className="text-white/60 mb-8">
            {!hasAccessToType 
              ? `Seu plano atual não inclui acesso à modalidade de ${type === 'running' ? 'Corrida' : 'Musculação'}.`
              : "Você ainda não possui um plano ativo ou acaba de expirar. Assine para liberar o acesso total ao hub e treinos."
            }
          </p>
          <Link href="/dashboard" className="btn-premium btn-primary w-full flex items-center justify-center gap-2 mb-4">
            Voltar ao Dashboard
          </Link>
          <Link href="/#pricing" className="text-primary hover:text-white transition-colors text-xs font-black uppercase italic tracking-widest">
            Quero fazer um Upgrade
            <ArrowRight className="inline h-3 w-3 ml-2" />
          </Link>
        </div>
      </main>
    );
  }

  if (!activeProgram) {
    return (
      <main className="min-h-screen pt-24 pb-12 bg-black">
        <div className="container mx-auto px-6 text-center">
          <Calendar className="h-16 w-16 text-primary/20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Aguardando seu Programa</h1>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            Seu treinador ainda não atribuiu um programa de treinamento personalizado para você. Assim que configurado, suas fichas aparecerão aqui!
          </p>
          <Link href="/dashboard" className="text-primary hover:underline font-bold">
            Voltar ao Hub
          </Link>
        </div>
      </main>
    );
  }

  // Filtrar as fichas pelo tipo solicitado (gym ou running)
  const filteredWorkouts = activeProgram.workouts.filter((pw: any) => pw.type === type);
  
  // Se não houver fichas do tipo solicitado, mostra a primeira disponível de qualquer tipo
  const currentWorkouts = filteredWorkouts.length > 0 ? filteredWorkouts : activeProgram.workouts;

  const selectedWorkout = currentWorkouts.find((pw: any) => pw.id === sheet) || currentWorkouts[0];
  
  // Buscar últimas cargas para os exercícios desta ficha
  const exerciseIds = selectedWorkout?.workout.exercises.map((e: any) => e.id) || [];
  const lastLoads = dbUserId ? await getExerciseLastLoads(dbUserId, exerciseIds) : {};

  return (
    <main className="min-h-screen pt-24 pb-12 bg-black">
      <div className="container mx-auto px-6">
        {/* Cabeçalho do Programa */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/dashboard" className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-primary transition">
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Link>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Meu Plano de Treino</span>
            </div>
            
            <h1 className="text-4xl font-black italic tracking-tighter mb-2 uppercase leading-none">
              {type === 'running' ? 'Cronograma de Corrida' : activeProgram.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black italic">
                <Calendar className="h-3 w-3" />
                {activeProgram.durationDays} DIAS
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-white/40 text-xs font-medium">
                {type === 'running' ? 'Treino selecionado: ' : 'Ficha atual: '} 
                <span className="text-white font-bold">{selectedWorkout?.label}</span>
              </p>
            </div>
          </div>
          <UserButton />
        </header>

        {/* Lembrete para Corredores */}
        {type === 'running' && (
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/60">
                <span className="text-white font-bold block mb-0.5">Dica Pro: Programa Híbrido</span>
                Seu programa completo de musculação e fortalecimento está disponível no menu <Link href="/dashboard/workouts?type=gym" className="text-primary hover:underline font-black italic">MEU TREINO</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Seleção de Fichas estilo Ficheiro (AnyFit Style) */}
        <div className="relative flex items-end gap-1 mb-0 px-2 overflow-x-auto scrollbar-hide border-b-2 border-zinc-900/50">
          {currentWorkouts.map((pw: any) => {
            const isActive = selectedWorkout?.id === pw.id;
            return (
              <Link 
                key={pw.id}
                href={`/dashboard/workouts?type=${type}&sheet=${pw.id}`}
                className={`relative flex items-center justify-center min-w-[80px] h-12 px-6 rounded-t-2xl font-black italic uppercase text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-zinc-900 text-primary z-10 scale-y-105' 
                    : 'bg-zinc-900/30 text-white/30 hover:bg-zinc-900/50 hover:text-white/50 -mb-1'
                }`}
              >
                {/* Indicador de Aba Ativa */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                )}
                <span className="relative z-10">{pw.label}</span>
                
                {/* Cantos Arredondados estilo Ficheiro (Opcional se usar background sólido) */}
                {isActive && (
                  <>
                    <div className="absolute -left-4 bottom-0 w-4 h-4 bg-zinc-900 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
                    <div className="absolute -right-4 bottom-0 w-4 h-4 bg-zinc-900 [clip-path:polygon(0_0,0_100%,100%_100%)]" />
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Container da Ficha (Corpo do Ficheiro) */}
        <div className="bg-zinc-900/40 rounded-b-[40px] rounded-tr-[40px] p-1 sm:p-4 border-t-0 border border-white/5 shadow-2xl mb-10">
          <div className="p-4 sm:p-8">
            {selectedWorkout ? (
              <WorkoutClientView 
                workout={selectedWorkout.workout} 
                selectedLabel={selectedWorkout.label} 
                userId={dbUserId || ""}
                isDeloadActive={!!isDeloadActive}
                lastLoads={lastLoads}
              />
            ) : (
              <div className="text-center py-20 bg-zinc-900/50 rounded-[40px] border border-dashed border-white/5">
                <Lock className="h-12 w-12 text-white/10 mx-auto mb-4" />
                <div className="text-white/20 uppercase font-black tracking-widest text-sm">
                  Selecione sua ficha para treinar
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
