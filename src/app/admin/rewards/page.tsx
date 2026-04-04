"use client";

import { useState, useEffect } from "react";
import { getRewards, createReward, deleteReward } from "@/app/actions/rewards";
import { Trophy, Plus, Trash2, Coins, ArrowLeft, Loader2, Sparkles, Upload } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchRewards();
  }, []);

  async function fetchRewards() {
    const data = await getRewards();
    setRewards(data);
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !cost) return;

    setIsSubmitting(true);
    const res = await createReward({ 
      name, 
      description, 
      cost: parseInt(cost),
      imageUrl
    });

    if (res.success) {
      toast.success("Recompensa criada com sucesso!");
      setName("");
      setDescription("");
      setCost("");
      setImageUrl("");
      fetchRewards();
    } else {
      toast.error(`Erro: ${res.error || "Falha ao salvar no banco"}`);
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta recompensa?")) return;
    
    const res = await deleteReward(id);
    if (res.success) {
      toast.success("Removido.");
      fetchRewards();
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4">
              <ArrowLeft size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Painel Admin</span>
            </Link>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <Trophy className="text-primary h-10 w-10" />
              Gestão de <span className="text-primary">Rewards</span>
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Gotoo Move Rewards Engine</div>
            <div className="text-2xl font-black italic text-white/10 uppercase">v1.0</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side (Esquerda) */}
          <div className="lg:col-span-4">
            <div className="glass p-8 rounded-[40px] border border-white/5 sticky top-28 bg-zinc-900/50 backdrop-blur-xl">
              <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
                <Plus className="text-primary" />
                Novo Prêmio
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block ml-2">Título do Prêmio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Luva de Musculação"
                    className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-sm font-bold placeholder:text-white/10 focus:border-primary/50 outline-none transition"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block ml-2">Descrição / Regras</label>
                  <textarea 
                    placeholder="Ex: Retire na recepção da academia parceira."
                    className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-sm font-bold placeholder:text-white/10 focus:border-primary/50 outline-none transition h-32"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block ml-2">Custo em FitCoins</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="500"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 pl-12 text-sm font-bold placeholder:text-white/10 focus:border-primary/50 outline-none transition"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      required
                    />
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block ml-2 italic">Foto do Prêmio</label>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Opção 1: Upload */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border-dashed group hover:border-primary/30 transition-all">
                      <UploadButton
                        endpoint="rewardImage"
                        onUploadBegin={() => setIsUploading(true)}
                        onClientUploadComplete={(res) => {
                          setIsUploading(false);
                          if (res?.[0]) {
                            setImageUrl(res[0].url);
                            toast.success("Foto carregada!");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          setIsUploading(false);
                          toast.error(`Erro: ${error.message}`);
                        }}
                        appearance={{
                          button: "bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl h-auto border-none",
                          allowedContent: "text-[8px] uppercase font-bold text-white/20 mt-2"
                        }}
                        content={{
                          button: isUploading ? "Carregando..." : "Upload do PC",
                          allowedContent: "Imagens até 4MB"
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[8px] font-black uppercase text-white/10">Ou use um link</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>

                    {/* Opção 2: URL manual */}
                    <input 
                      type="url" 
                      placeholder="https://link-da-imagem.com/foto.jpg"
                      className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 text-sm font-bold placeholder:text-white/10 focus:border-primary/50 outline-none transition"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                    />
                  </div>

                  {imageUrl && (
                    <div className="mt-4 relative group">
                      <div className="h-32 w-full rounded-2xl overflow-hidden border border-white/10">
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-xl border border-white/10"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  disabled={isSubmitting || isUploading}
                  className="w-full py-5 bg-primary text-black font-black italic uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Publicar Prêmio"}
                </button>
              </form>
            </div>
          </div>

          {/* List Side (Direita) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between px-4 mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Prêmios Disponíveis ({rewards.length})</h3>
              <Sparkles className="text-primary/20 h-5 w-5" />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Banco...</span>
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-20 glass rounded-[40px] border border-white/5 border-dashed">
                <Trophy className="h-12 w-12 text-white/5 mx-auto mb-4" />
                <p className="text-white/20 uppercase font-bold text-xs tracking-widest leading-relaxed">
                  Não há prêmios cadastrados.<br/>Comece criando um à esquerda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map(reward => (
                  <div key={reward.id} className="group glass p-6 rounded-[32px] border border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(reward.id)}
                        className="text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      {reward.imageUrl ? (
                        <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                          <img src={reward.imageUrl} alt={reward.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                          <Trophy className="text-primary h-8 w-8" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h4 className="font-black italic uppercase text-lg tracking-tight truncate">{reward.title}</h4>
                        <div className="flex items-center gap-1.5 text-primary">
                          <Coins size={12} />
                          <span className="text-xs font-black">{reward.cost} FC</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/40 text-xs leading-relaxed italic mb-4 line-clamp-3">
                      {reward.description || "Sem descrição disponível."}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Ativo</span>
                       <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
