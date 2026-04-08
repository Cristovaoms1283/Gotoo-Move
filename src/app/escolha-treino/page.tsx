"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, Home, ArrowRight, Footprints, ChevronLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

const RUNNING_OPTIONS = [
  { id: "3km", label: "Corrida 3km", description: "Ideal para iniciantes e adaptação." },
  { id: "5km", label: "Corrida 5km", description: "O clássico das provas de rua." },
  { id: "7km", label: "Corrida 7km", description: "Avançando no volume semanal." },
  { id: "10km", label: "Corrida 10km", description: "A meta de 1 hora de superação." },
  { id: "12km+", label: "12km ou mais", description: "Nível intermediário/avançado.", requiresLevel: true },
];

import { updateUserRunningGoal } from "../actions/running";

export default function EscolhaTreinoPage() {
  const [step, setStep] = useState<"category" | "distance" | "gym_goal">("category");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [gymGoal, setGymGoal] = useState("");
  const [levelInfo, setLevelInfo] = useState({ time5k: "", time10k: "" });
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const GOALS = [
    { id: "hipertrofia", label: "Hipertrofia", description: "Foco em massa muscular." },
    { id: "emagrecimento", label: "Emagrecimento", description: "Foco em definição." },
    { id: "condicionamento", label: "Condicionamento", description: "Foco em resistência." },
    { id: "reabilitacao", label: "Reabilitação", description: "Foco em recuperação." },
  ];

  const handleFinishRunningSetup = async (advance = false) => {
    if (!gymGoal) return;
    setIsPending(true);
    try {
      await updateUserRunningGoal({
        distance: selectedDistance,
        gymGoal: gymGoal,
        time5k: advance ? levelInfo.time5k : undefined,
        time10k: advance ? levelInfo.time10k : undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setIsPending(false);
    }
  };

  const handleSelectDistance = (id: string) => {
    setSelectedDistance(id);
    setStep("gym_goal");
  };

  const handleConfirmAdvance = () => {
    setStep("gym_goal");
  };

  if (step === "gym_goal") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl w-full z-10 relative">
          <button 
            onClick={() => setStep("distance")}
            className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors mb-8 group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            VOLTAR PARA DISTÂNCIA
          </button>

          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 text-white uppercase">
              SEU FORTALECIMENTO NA <span className="text-primary italic">ACADEMIA</span>
            </h1>
            <p className="text-white/60 text-lg">Qual o seu objetivo principal na musculação para acompanhar a corrida?</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {GOALS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGymGoal(opt.label)}
                className={`relative p-6 rounded-[25px] border transition-all text-left ${
                  gymGoal === opt.label 
                    ? "bg-primary border-primary text-black" 
                    : "bg-white/[0.03] border-white/10 text-white hover:border-primary/50"
                }`}
              >
                <h3 className="text-xl font-black italic uppercase mb-1">{opt.label}</h3>
                <p className={`text-sm ${gymGoal === opt.label ? "text-black/70" : "text-white/40"}`}>
                  {opt.description}
                </p>
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleFinishRunningSetup(selectedDistance === "12km+")}
            disabled={!gymGoal || isPending}
            className="w-full py-5 bg-white hover:bg-primary text-black font-black uppercase text-xl rounded-2xl transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? "Configurando..." : "Finalizar Periodização Mensal"}
          </button>
        </div>
      </main>
    );
  }

  if (step === "distance") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl w-full z-10 relative">
          <button 
            onClick={() => setStep("category")}
            className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors mb-8 group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            VOLTAR PARA MODALIDADES
          </button>

          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 text-white uppercase">
              QUAL A SUA <span className="text-primary italic">META DE DISTÂNCIA?</span>
            </h1>
            <p className="text-white/60 text-lg">Selecione o plano ideal para a sua periodização.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {RUNNING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => opt.requiresLevel ? setSelectedDistance(opt.id) : handleSelectDistance(opt.id)}
                className={`relative group p-6 rounded-[25px] border transition-all duration-300 text-left ${
                  selectedDistance === opt.id 
                    ? "bg-primary border-primary text-black" 
                    : "bg-white/[0.03] border-white/10 text-white hover:border-primary/50"
                }`}
              >
                <h3 className="text-xl font-black italic uppercase italic mb-1">{opt.label}</h3>
                <p className={`text-sm ${selectedDistance === opt.id ? "text-black/70" : "text-white/40"}`}>
                  {opt.description}
                </p>
              </button>
            ))}
          </div>

          {selectedDistance === "12km+" && (
            <div className="mt-12 glass p-8 rounded-[30px] border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/20 text-primary rounded-full">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">NÍVEL DE PERFORMANCE</h3>
                  <p className="text-white/40 text-sm italic uppercase tracking-widest font-bold">12km+ exige preparo físico intermediário.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Seu melhor tempo em 5km</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 24:30" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors"
                    value={levelInfo.time5k}
                    onChange={(e) => setLevelInfo({ ...levelInfo, time5k: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest">Seu melhor tempo em 10km</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 52:15" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors"
                    value={levelInfo.time10k}
                    onChange={(e) => setLevelInfo({ ...levelInfo, time10k: e.target.value })}
                  />
                </div>
              </div>

              <button 
                onClick={handleConfirmAdvance}
                className="w-full py-5 bg-primary hover:bg-white text-black font-black italic tracking-tighter text-xl rounded-2xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.1)] uppercase"
              >
                Ativar Periodização 12km+
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl w-full z-10 relative">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter mb-4 text-white uppercase drop-shadow-lg">
            ONDE SERÁ O SEU <br className="hidden md:block" />
            <span className="text-primary">TREINO HOJE?</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Escolha o ambiente ideal para focar no seu resultado.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Opção Academia */}
          <Link href="/dashboard" className="group">
            <div className="relative glass p-10 rounded-[40px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-6 rounded-full bg-white/5 text-primary group-hover:bg-primary group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <Dumbbell className="h-14 w-14" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white">Na Academia</h2>
                <p className="text-white/40 leading-relaxed max-w-[240px] mx-auto group-hover:text-white/60 transition-colors">
                  Acesse sua ficha de musculação, vídeos de execução e histórico de peso.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Acessar Ficha <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Opção Corrida de Rua */}
          <button onClick={() => setStep("distance")} className="group text-left h-full">
            <div className="relative glass p-10 rounded-[40px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-6 rounded-full bg-white/5 text-green-400 group-hover:bg-green-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <Footprints className="h-14 w-14" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white">Corrida de Rua</h2>
                <p className="text-white/40 leading-relaxed max-w-[240px] mx-auto group-hover:text-white/60 transition-colors">
                  Planilhas de 3km a 12km+ com periodização de 52 semanas.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-green-400 font-bold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Escolher Distância <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </button>

          {/* Opção Casa */}
          <Link href="/treino-em-casa" className="group">
            <div className="relative glass p-10 rounded-[40px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-6 rounded-full bg-white/5 text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <Home className="h-14 w-14" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white">Em Casa</h2>
                <p className="text-white/40 leading-relaxed max-w-[240px] mx-auto group-hover:text-white/60 transition-colors">
                  Aulas de 30 minutos em formato &quot;siga o professor&quot;.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Começar Aulas <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
