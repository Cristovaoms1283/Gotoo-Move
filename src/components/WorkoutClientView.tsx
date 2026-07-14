"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Award, Clock, Check, RotateCcw, FastForward, Timer as TimerIcon, Trophy, TrendingUp } from "lucide-react";
import ExerciseList from "./ExerciseList";
import WorkoutFeedbackModal from "./WorkoutFeedbackModal";
import { saveWorkoutLog, toggleDeload, saveExerciseLoad } from "@/app/actions/workouts";
import LoadHistoryModal from "./LoadHistoryModal";
import { toast } from "sonner";

interface ActiveTimer {
  exerciseId: string;
  timeLeft: number;
  totalTime: number;
  exerciseName: string;
}
export default function WorkoutClientView({ 
  workout, 
  selectedLabel, 
  userId,
  isDeloadActive = false,
  lastLoads = {}
}: { 
  workout: any, 
  selectedLabel: string,
  userId?: string,
  isDeloadActive?: boolean,
  lastLoads?: Record<string, number>
}) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [setsCompleted, setSetsCompleted] = useState<Record<string, number>>({});
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deloadSuggested, setDeloadSuggested] = useState(false);
  const [currentLoad, setCurrentLoad] = useState<string>("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const activeExercise = workout.exercises[activeExerciseIndex] || workout.exercises[0];

  // Cronômetro da sessão
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted]);

  // Reset load when exercise changes
  useEffect(() => {
    setCurrentLoad("");
  }, [activeExerciseIndex]);

  // Função para tocar o alarme sonoro
  const playTimerEndSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      
      // Beep duplo rápido
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };

      playBeep(audioCtx.currentTime, 880); // Lá 5
      playBeep(audioCtx.currentTime + 0.4, 880); // Segundo beep
    } catch (e) {
      console.warn("Navegador bloqueou áudio ou erro na Web Audio API:", e);
    }
  };

  // Cronômetro de descanso
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            playTimerEndSound();
            toast.success("Descanso finalizado! Próxima série.", {
              icon: "🔔",
              duration: 5000
            });
            return null;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer?.exerciseId]);

  const parseRestTime = (rest: string | null): number => {
    if (!rest) return 0;
    const r = rest.toLowerCase().trim();
    if (r.includes('min')) return parseInt(r.match(/(\d+)/)?.[0] || "0") * 60;
    const parts = r.split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return parseInt(r.match(/(\d+)/)?.[0] || "0");
  };

  const handleSetToggle = async (exercise: any, exerciseIdx: number) => {
    if (!workoutStarted) return;
    
    const currentSetsDone = setsCompleted[exercise.id] || 0;
    const totalSets = exercise.isGironda ? 8 : parseInt(exercise.sets || "3");

    if (currentSetsDone < totalSets) {
      const nextSetsDone = currentSetsDone + 1;
      setSetsCompleted(prev => ({ ...prev, [exercise.id]: nextSetsDone }));

      // Só salvar se houver um usuário (não é preview)
      if (userId) {
        // Salvar carga se estiver definida
        if (currentLoad && !isNaN(parseFloat(currentLoad))) {
          saveExerciseLoad(userId, exercise.id, parseFloat(currentLoad));
        }
      }

      // Timer se não for a última série
      if (nextSetsDone < totalSets && (exercise.rest || exercise.isGironda)) {
        const restSeconds = exercise.isGironda ? 30 : parseRestTime(exercise.rest);
        if (restSeconds > 0) {
          setActiveTimer({
            exerciseId: exercise.id,
            timeLeft: restSeconds,
            totalTime: restSeconds,
            exerciseName: exercise.name
          });
        }
      } else if (nextSetsDone === totalSets) {
        // Concluiu exercício
        setActiveTimer(null);
        if (activeExerciseIndex + 1 < workout.exercises.length) {
          setTimeout(() => setActiveExerciseIndex(prev => prev + 1), 500);
        }
      }
    }
  };

  const handleFinishWorkout = async (effort: number) => {
    setIsSubmitting(true);
    const durationMinutes = Math.floor(sessionTime / 60);

    if (!userId) {
      toast.error("Sessão de usuário não identificada. O progresso não foi salvo.");
      setIsSubmitting(false);
      return;
    }

    const result = await saveWorkoutLog({
      userId,
      workoutId: workout.id,
      duration: durationMinutes,
      effortScale: effort
    });

    setIsSubmitting(false);
    setIsFeedbackModalOpen(false);

    if (result.success) {
      if (result.suggestDeload) {
        setDeloadSuggested(true);
      }
      toast.success(`Treino salvo! +${result.fitCoinsGained} FitCoins. Ofensiva: ${result.newStreak} dias!`);
    } else {
      toast.error("Erro ao salvar treino.");
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-6">
        {/* Player Principal */}
        <div className="glass rounded-[40px] overflow-hidden aspect-video relative shadow-2xl border border-white/5 bg-black/50 overflow-hidden">
          {activeExercise && workoutStarted ? (
            <div className="relative w-full h-full">
              {activeExercise.youtubeId?.match(/\.(mp4|webm|mov|ogg)$/i) ? (
                <video
                  key={`${activeExerciseIndex}-${activeExercise.youtubeId}`}
                  src={activeExercise.youtubeId}
                  className="w-full h-full object-cover"
                  autoPlay loop muted playsInline
                />
              ) : (
                <img
                  key={`${activeExerciseIndex}-${activeExercise.youtubeId}`}
                  src={activeExercise.youtubeId || "https://placehold.co/600x400/000/fff?text=Sem+Vídeo"}
                  alt={activeExercise.name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay de Cronômetro de Descanso (Modo Academia) */}
              {activeTimer && activeTimer.exerciseId === activeExercise.id && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                  <div className="text-primary/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Descanse agora</div>
                  <div className="text-8xl font-black italic text-primary animate-pulse tabular-nums">
                    {formatTime(activeTimer.timeLeft)}
                  </div>
                  <button 
                    onClick={() => setActiveTimer(null)}
                    className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10"
                  >
                    Pular Descanso
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 absolute inset-0 text-center px-4">
               {!workoutStarted ? (
                 <>
                   <PlayCircle className="w-16 h-16 text-primary/50 mb-4" />
                   <h3 className="text-xl font-black italic uppercase text-white">Academia ou Casa?</h3>
                   <p className="text-white/50 text-sm mt-2 max-w-sm">Inicie para ativar o <strong className="text-primary uppercase">Modo Academia</strong> com botões grandes e timer automático.</p>
                 </>
               ) : (
                 <div className="text-primary font-black italic uppercase animate-bounce">Fim da Ficha! 🎉</div>
               )}
            </div>
          )}
        </div>

        {/* CONTROLES MODO ACADEMIA (BOTÕES GRANDES) */}
        {workoutStarted && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSetToggle(activeExercise, activeExerciseIndex)}
              disabled={!!activeTimer}
              className={`flex flex-col items-center justify-center p-8 rounded-[40px] border-2 transition-all ${
                activeTimer ? 'bg-zinc-800 border-zinc-700 opacity-50' : 'bg-primary border-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95'
              }`}
            >
              <Check className="h-10 w-10 text-black mb-2" />
              <span className="text-black font-black italic uppercase tracking-tighter text-xl leading-none">Concluir Série</span>
              <span className="text-black/60 text-[10px] uppercase font-bold mt-1">
                Série {setsCompleted[activeExercise.id] || 0} de {activeExercise.isGironda ? 8 : (isDeloadActive ? Math.ceil(parseInt(activeExercise.sets || "3") * 0.7) : (activeExercise.sets || 3))}
              </span>
            </button>

            <button
               onClick={() => setIsFeedbackModalOpen(true)}
               className="flex flex-col items-center justify-center p-8 rounded-[40px] border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-black transition-all group shadow-[0_0_40px_rgba(249,115,22,0.1)]"
            >
              <Trophy className="h-10 w-10 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-black italic uppercase tracking-tighter text-xl leading-none">Terminar Treino</span>
              <span className="text-[10px] uppercase font-bold mt-1 opacity-60">Salvar Pontos & Borg</span>
            </button>
          </div>
        )}
        
        {/* Sugestão de Deload */}
        {deloadSuggested && (
          <div className="glass p-8 rounded-[40px] border border-orange-500/30 bg-orange-500/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RotateCcw className="h-8 w-8 text-orange-500 animate-spin-slow" />
              <div>
                <h4 className="text-lg font-black italic uppercase leading-none mb-1 text-orange-500">Sugestão de Deload</h4>
                <p className="text-white/60 text-xs max-w-md">Vimos que seus últimos treinos foram exaustivos. Deseja reduzir a intensidade em 30% esta semana para recuperação?</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                if (!userId) return;
                await toggleDeload(userId, true);
                setDeloadSuggested(false);
                toast.success("Modo Deload Ativado! Intensidade reduzida em 30%.");
              }}
              className="bg-orange-500 text-black px-6 py-3 rounded-2xl font-black italic uppercase text-xs hover:scale-105 transition-transform"
            >
              Aceitar 30% OFF
            </button>
          </div>
        )}

        {/* Info do Exercício */}
        <div className="glass p-8 rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
              <PlayCircle className="text-primary h-8 w-8" />
              {activeExercise?.name}
            </h2>
            {workoutStarted && (
               <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl font-mono text-lg font-black">
                 {formatTime(sessionTime)}
               </div>
            )}
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            {activeExercise?.description || workout.description}
          </p>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:border-primary/50 px-4 py-2 rounded-xl"
          >
            <TrendingUp className="h-3 w-3" />
            Ver Histórico de Cargas
          </button>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4">
        {/* Input de Carga - Visível apenas quando iniciado */}
        {workoutStarted && activeExercise && (
          <div className="glass p-6 rounded-[32px] border border-primary/20 bg-primary/5 mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3 block">Carga do Exercício (kg)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={currentLoad}
                onChange={(e) => setCurrentLoad(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-2xl font-black italic text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/5"
              />
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 font-black italic">
                KG
              </div>
            </div>
          </div>
        )}
        <ExerciseList 
          exercises={workout.exercises} 
          activeExerciseIndex={activeExerciseIndex}
          onExerciseSelect={setActiveExerciseIndex}
          workoutStarted={workoutStarted}
          setWorkoutStarted={setWorkoutStarted}
          setsCompleted={setsCompleted}
          activeTimer={activeTimer}
          isDeloadActive={isDeloadActive}
          lastLoads={lastLoads}
        />
      </div>

      <WorkoutFeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFinishWorkout}
        isSubmitting={isSubmitting}
      />

      <LoadHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        exerciseId={activeExercise?.id}
        exerciseName={activeExercise?.name}
        userId={userId}
      />
    </div>
  );
}
