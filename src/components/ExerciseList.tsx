"use client";

import { Award, PlayCircle, Check } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  sets: string | null;
  reps: string | null;
  rest: string | null;
  isGironda?: boolean;
}

interface ActiveTimer {
  exerciseId: string;
  timeLeft: number;
  totalTime: number;
  exerciseName: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  activeExerciseIndex?: number;
  onExerciseSelect?: (index: number) => void;
  workoutStarted: boolean;
  setWorkoutStarted: (v: boolean) => void;
  setsCompleted: Record<string, number>;
  activeTimer: ActiveTimer | null;
  isDeloadActive?: boolean;
  lastLoads?: Record<string, number>;
}

export default function ExerciseList({ 
  exercises,
  activeExerciseIndex = 0,
  onExerciseSelect = () => {},
  workoutStarted,
  setWorkoutStarted,
  setsCompleted,
  activeTimer,
  isDeloadActive = false,
  lastLoads = {}
}: ExerciseListProps) {

  // Helper para reduzir valores em 30% (mínimo 1)
  const applyDeload = (val: string | null) => {
    if (!val || !isDeloadActive) return val;
    
    // Tenta encontrar números na string (ex: "12-15" ou "12")
    return val.replace(/\d+/g, (match) => {
      const num = parseInt(match);
      const reduced = Math.ceil(num * 0.7); // Redução de 30%
      return Math.max(1, reduced).toString();
    });
  };

  return (
    <div className="space-y-4">
      {/* Botão de Iniciar Treino */}
      {!workoutStarted && (
        <div className="mb-4">
          <button 
            onClick={() => setWorkoutStarted(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black italic tracking-widest uppercase py-4 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all animate-pulse"
          >
            Iniciar Ficha Agora
          </button>
        </div>
      )}

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {exercises.map((exercise, idx) => {
          const totalSets = exercise.isGironda ? 8 : parseInt(exercise.sets || "3");
          const completedCount = setsCompleted[exercise.id] || 0;
          const isFullyDone = completedCount >= totalSets;
          const isActive = activeExerciseIndex === idx;

          return (
            <div 
              key={exercise.id} 
              onClick={() => onExerciseSelect(idx)}
              className={`group relative glass p-5 rounded-[32px] border transition-all duration-500 cursor-pointer ${
                isActive 
                  ? 'ring-2 ring-primary border-transparent scale-[1.02] z-10 opacity-100' 
                  : 'opacity-60 grayscale-[0.5] hover:opacity-80 hover:grayscale-0'
              } ${
                isFullyDone 
                  ? 'border-green-500/50 bg-green-500/5 !opacity-100 !grayscale-0' 
                  : 'border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center font-black italic shrink-0 transition-all ${
                  isFullyDone
                    ? 'bg-green-500 border-green-500 text-black'
                    : isActive 
                      ? 'bg-primary border-primary text-black'
                      : 'bg-zinc-950 border-white/5 text-primary'
                }`}>
                  {isFullyDone ? <Check className="h-6 w-6" /> : idx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm uppercase italic truncate ${isFullyDone ? 'text-white/40 line-through' : ''}`}>
                    {exercise.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 mb-4">
                     <div className="flex items-center gap-1 shrink-0">
                       <Award className="h-3 w-3 text-primary/50" />
                       <span className="text-[10px] font-black italic text-white/60">
                         {exercise.isGironda ? '8x8 GIRONDA' : `${exercise.sets || '3'} SÉRIES`}
                       </span>
                     </div>
                     <div className="w-1 h-1 rounded-full bg-white/10 shrink-0" />
                      <div className="flex items-center gap-1 shrink-0">
                        <PlayCircle className="h-3 w-3 text-primary/50" />
                        <span className="text-[10px] font-black italic text-white/60">{exercise.reps || '12'} REPS</span>
                      </div>
                      {lastLoads[exercise.id] && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-white/10 shrink-0" />
                          <div className="flex items-center gap-1 shrink-0 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                            <span className="text-[9px] font-black italic text-primary uppercase">Última: {lastLoads[exercise.id]}kg</span>
                          </div>
                        </>
                      )}
                  </div>

                  {/* Visualização de Progresso de Séries */}
                  <div className="flex gap-1.5 h-1.5 mt-2 overflow-hidden rounded-full bg-white/5">
                    {Array.from({ length: totalSets }).map((_, sIdx) => (
                      <div
                        key={sIdx}
                        className={`h-full flex-1 transition-all duration-500 ${
                          sIdx < completedCount
                            ? 'bg-green-500'
                            : sIdx === completedCount && isActive && workoutStarted
                              ? 'bg-primary/40 animate-pulse'
                              : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
