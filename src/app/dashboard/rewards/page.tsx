"use client";

import { useState, useEffect } from "react";
import { getRewards, redeemReward, getUserStats } from "@/app/actions/rewards";
import { useUser } from "@clerk/nextjs";
import { Trophy, Coins, Sparkles, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function RewardsPage() {
  const { user } = useUser();
  const [rewards, setRewards] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  async function loadData() {
    const [rewardsData, statsData] = await Promise.all([
      getRewards(),
      getUserStats(user?.id || "")
    ]);
    setRewards(rewardsData);
    setUserStats(statsData);
    setIsLoading(false);
  }

  async function handleRedeem(rewardId: string, cost: number) {
    if (!user?.id) return;
    if ((userStats?.fitCoins || 0) < cost) {
      toast.error("FitCoins insuficientes!");
      return;
    }

    setIsRedeeming(rewardId);
    const res = await redeemReward(user.id, rewardId);
    
    if (res.success) {
      toast.success("Resgate solicitado com sucesso! Verifique seu e-mail.");
      loadData();
    } else {
      toast.error(res.error || "Erro ao resgatar.");
    }
    setIsRedeeming(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <span className="text-[10px] font-black italic uppercase tracking-[0.3em] animate-pulse">Sincronizando seus Pontos...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-zinc-950 text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Logo" className="h-4 w-4 object-contain" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Gotoo Move Rewards</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
            Sua Constância <br/> 
            <span className="text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">Vale Prêmios</span>
          </h1>
          <p className="text-white/40 max-w-xl text-lg italic leading-relaxed">
            Acumule <span className="text-white font-bold">FitCoins</span> treinando diariamente e troque por benefícios reais. Mantendo sua ofensiva, você desbloqueia bônus exclusivos.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* FitCoins Card */}
          <div className="glass p-8 rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-2xl relative overflow-hidden group">
            <Coins className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Carteira Virtual</div>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-black italic tracking-tighter text-white tabular-nums">
                  {userStats?.fitCoins || 0}
                </div>
                <div className="px-3 py-1 bg-primary/10 rounded-lg text-primary text-xs font-black italic uppercase">
                  FitCoins
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                 <CheckCircle2 size={12} />
                 Atualizado após cada treino
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="glass p-8 rounded-[40px] border border-orange-500/10 bg-orange-500/5 backdrop-blur-2xl relative overflow-hidden group">
            <Flame className="absolute -bottom-4 -right-4 h-32 w-32 text-orange-500/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-orange-500/40 mb-2">Ofensiva de Treino</div>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-black italic tracking-tighter text-white tabular-nums">
                  {userStats?.streak || 0}
                </div>
                <div className="px-3 py-1 bg-orange-500/10 rounded-lg text-orange-500 text-xs font-black italic uppercase">
                  Dias 🔥
                </div>
              </div>
              <p className="mt-6 text-white/40 text-xs font-medium italic">
                Treine amanhã para chegar em <span className="text-orange-500 font-bold">{(userStats?.streak || 0) + 1} dias</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Rewards Shelf */}
        <div>
          <div className="flex items-center justify-between mb-8 px-4">
             <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
               <Sparkles className="text-primary h-6 w-6" />
               Vitrine de Trocas
             </h3>
             <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Edição Especial</span>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-20 glass rounded-[40px] border border-dashed border-white/5">
              <Trophy className="h-12 w-12 text-white/5 mx-auto mb-4" />
              <p className="text-white/20 uppercase font-black tracking-widest text-sm">Nenhum prêmio disponível este mês.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, idx) => {
                const canAfford = (userStats?.fitCoins || 0) >= reward.cost;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={reward.id} 
                    className={`group glass rounded-[40px] border transition-all duration-500 overflow-hidden ${
                      canAfford 
                        ? 'border-white/5 hover:border-primary/30 hover:bg-primary/[0.02]' 
                        : 'border-white/5 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative h-48 w-full group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                      {reward.imageUrl ? (
                        <img 
                          src={reward.imageUrl} 
                          alt={reward.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Trophy size={48} className="text-white/5" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <Coins size={14} className="text-primary" />
                        <span className="text-sm font-black italic tabular-nums text-white">{reward.cost}</span>
                      </div>
                    </div>

                    <div className="p-8 pt-6">
                      <h4 className="text-xl font-black italic uppercase tracking-tight mb-2 truncate group-hover:text-primary transition-colors">
                        {reward.title}
                      </h4>
                      <p className="text-white/40 text-xs leading-relaxed italic mb-8 line-clamp-2">
                        {reward.description || "Resgate esta recompensa exclusiva acumulando pontos de treino."}
                      </p>

                      <button
                        disabled={!canAfford || (isRedeeming === reward.id)}
                        onClick={() => handleRedeem(reward.id, reward.cost)}
                        className={`w-full py-4 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all relative overflow-hidden ${
                          canAfford
                            ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] hover:scale-[1.02] active:scale-95'
                            : 'bg-white/5 text-white/20 border border-white/5'
                        }`}
                      >
                        {isRedeeming === reward.id ? (
                           <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : canAfford ? (
                          <span className="flex items-center justify-center gap-2">
                             Resgatar Agora <ArrowRight size={14} />
                          </span>
                        ) : (
                          "FitCoins Insuficientes"
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
