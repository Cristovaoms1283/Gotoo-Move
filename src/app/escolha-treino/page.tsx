import Link from "next/link";
import { Dumbbell, Home, ArrowRight } from "lucide-react";

export default function EscolhaTreinoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl w-full z-10 relative">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 text-white uppercase drop-shadow-lg">
            ONDE SERÁ O SEU <span className="text-primary block md:inline">TREINO HOJE?</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Escolha o ambiente ideal para focar no seu resultado.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Opção Academia */}
          <Link href="/dashboard" className="group">
            <div className="relative glass p-10 rounded-[40px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 overflow-hidden min-h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="p-6 rounded-full bg-white/5 text-primary group-hover:bg-primary group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_var(--color-primary-glow)]">
                <Dumbbell className="h-16 w-16" />
              </div>

              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white">
                  Na Academia
                </h2>
                <p className="text-white/40 leading-relaxed max-w-[280px] mx-auto group-hover:text-white/60 transition-colors">
                  Acesse sua ficha de musculação, vídeos de execução e histórico de peso.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Acessar Ficha
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Opção Casa */}
          <Link href="/treino-em-casa" className="group">
            <div className="relative glass p-10 rounded-[40px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 flex flex-col items-center justify-center text-center gap-6 overflow-hidden min-h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="p-6 rounded-full bg-white/5 text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <Home className="h-16 w-16" />
              </div>

              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white">
                  Em Casa (HIIT)
                </h2>
                <p className="text-white/40 leading-relaxed max-w-[280px] mx-auto group-hover:text-white/60 transition-colors">
                  Aulas intensas de 30 minutos em formato &quot;siga o professor&quot; adaptadas para fazer onde estiver.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Começar Treino
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
