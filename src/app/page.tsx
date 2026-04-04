import Image from "next/image";
import Link from "next/link";
import { PricingSection } from "@/components/PricingSection";
import { Play, Shield, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-glow" />
        <Image
          src="/hero.png"
          alt="Treino Premium"
          fill
          className="object-cover opacity-50 -z-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background -z-10" />

        <div className="container mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary mb-8 animate-bounce">
            <Zap className="h-4 w-4 fill-primary" />
            <span className="text-sm font-bold uppercase tracking-wider">Acesso Imediato Liberado</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            TRANSFORME SEU <br />
            <span className="text-gradient">CORPO</span> E <span className="text-gradient">MENTE</span>.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 font-medium">
            Treinamentos de musculação, corrida e funcional direto no seu celular com vídeos passo a passo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="#pricing" className="btn-premium btn-primary w-full sm:w-auto text-lg">
              Escolher Meu Plano
            </Link>
            <Link href="#demo" className="btn-premium btn-outline w-full sm:w-auto text-lg">
              <Play className="h-5 w-5 fill-primary" />
              Ver Demonstração
            </Link>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 container px-6 justify-between items-center text-white/40 uppercase text-xs font-bold tracking-[0.3em]">
          <span>Videos em 4K</span>
          <span>Exercícios Validados</span>
          <span>Suporte 24/7</span>
          <span>Acesso Vitalício</span>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: TrendingUp, title: "Progresso Real", desc: "Planilhas evolutivas para você nunca estagnar no seu treinamento." },
              { icon: Shield, title: "Técnica Perfeita", desc: "Vídeos detalhados para garantir que cada movimento seja executado com segurança." },
              { icon: Zap, title: "Foco Total", desc: "Treinos diretos ao ponto, ideais para quem tem pouco tempo mas quer resultados." }
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-4 p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <f.icon className="h-10 w-10 text-primary" />
                <h3 className="text-2xl font-bold">{f.title}</h3>
                <p className="text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-white/40 text-sm">
        <p>&copy; 2026 Gotoo Move. Todos os direitos reservados. Treine com responsabilidade.</p>
      </footer>
    </main>
  );
}
