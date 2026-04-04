import Link from "next/link";
import { ArrowLeft, PlayCircle, Clock, Flame, Lock } from "lucide-react";
import { getHomeWorkouts } from "@/app/actions/home-workouts";
import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionStatus } from "@/lib/data";
import { cookies } from "next/headers";

export default async function TreinoEmCasaPage() {
  const workouts = await getHomeWorkouts();
  const user = await currentUser();
  const cookieStore = await cookies();
  const leadToken = (await cookieStore).get("fitconnect_lead_token");
  const isLeadConfirmed = !!leadToken;
  
  const { status, role } = await getUserSubscriptionStatus(user?.id || "");
  const isPremiumUser = status === "active" || role === "admin";

  return (
    <main className="min-h-screen pt-32 pb-12 bg-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6">
        <header className="mb-12">
          <Link 
            href="/escolha-treino" 
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 uppercase tracking-widest text-[10px] font-bold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Escolha de Treino
          </Link>
          
          {isLeadConfirmed && !isPremiumUser && (
            <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Bem-vindo(a) à sua Aula Experimental! 🎉</h2>
                <p className="text-white/60 text-sm">Gostou da aula? Libere o acesso completo por um preço especial.</p>
              </div>
              <Link href="/#pricing" className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95">
                Garantir Meu Plano Completo
              </Link>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 text-white uppercase flex items-center gap-3">
            TREINO EM CASA <span className="text-blue-500">HIIT</span>
            <Flame className="h-10 w-10 text-orange-500 animate-pulse" />
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Aulas intensas de 30 minutos para você fazer onde estiver, sem equipamento. Dê o play e siga o professor!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {workouts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/40 italic">
              Nenhuma aula disponível no momento.
            </div>
          ) : (
            workouts.map((video, index) => (
              <div 
                key={video.id}
                className="group relative glass p-6 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
                
                 <div className="relative z-10 w-full aspect-video rounded-2xl overflow-hidden mb-6 shadow-lg border border-white/10 bg-black">
                   
                   {index === 0 || isPremiumUser ? (
                      (() => {
                        const isVideoFile = video.youtubeId?.match(/\.(mp4|webm|mov|ogg)$/i) || video.youtubeId?.includes('uploadthing');
                        const isYouTube = !isVideoFile && video.youtubeId;
                        
                        if (isVideoFile) {
                          return (
                            <video 
                              src={video.youtubeId}
                              className="w-full h-full object-cover"
                              controls
                              autoPlay={false}
                              playsInline
                            />
                          );
                        }
                        
                        if (isYouTube) {
                          const ytId = video.youtubeId.includes('watch?v=') 
                            ? video.youtubeId.split('v=')[1]?.split('&')[0] 
                            : video.youtubeId.includes('youtu.be/')
                            ? video.youtubeId.split('youtu.be/')[1]?.split('?')[0]
                            : video.youtubeId;

                          return (
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        return (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-white/20" />
                          </div>
                        );
                      })()
                   ) : (
                     <div className="w-full h-full relative group cursor-not-allowed">
                        {/* Background com thumbnail ou blur */}
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                           <PlayCircle className="w-12 h-12 text-white/10" />
                        </div>
                        
                        {/* Overlay de Bloqueado */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
                           <div className="w-16 h-16 rounded-full border border-white/10 bg-black/50 flex items-center justify-center mb-4 text-white">
                              <Lock className="w-8 h-8 opacity-80" />
                           </div>
                           <h4 className="text-white font-black text-lg uppercase italic tracking-wider mb-2 text-center">
                             Conteúdo Exclusivo
                           </h4>
                           <p className="text-white/50 text-xs text-center font-medium max-w-[200px]">
                             Assine um plano para liberar este e todos os outros treinos HIIT.
                           </p>
                           <Link 
                             href="/#pricing" 
                             className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-bold tracking-widest rounded-full transition-colors border border-white/10"
                           >
                             Ver Planos
                           </Link>
                        </div>
                     </div>
                   )}

                 </div>

                <div className="relative z-10 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      30 Min
                    </div>
                  </div>

                  <p className="text-white/50 text-sm mb-4">
                    Instrutor: <span className="text-white/80 font-medium">{video.instructor}</span>
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-[10px] uppercase tracking-widest font-black text-white/40">
                      Nível: {video.level}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-black text-orange-400/80">
                      {video.calories}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
