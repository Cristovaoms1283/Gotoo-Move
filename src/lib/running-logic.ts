import { addDays, format, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday } from "date-fns";

export type RunningPhase = "BASE" | "DESENVOLVIMENTO" | "ESPECIFICO" | "PERFORMANCE";

export interface RunningWorkoutInfo {
  type: "RUNNING" | "STRENGTH" | "REST";
  title: string;
  description: string;
  phase: RunningPhase;
  week: number;
}

/**
 * Retorna o tipo de treino para um determinado dia dentro de um programa de corrida de 52 semanas.
 */
export function getRunningWorkoutSchedule(date: Date, weekNumber: number): RunningWorkoutInfo {
  // Determinar a fase baseada na semana (periodização de 52 semanas)
  let phase: RunningPhase = "BASE";
  if (weekNumber > 13 && weekNumber <= 26) phase = "DESENVOLVIMENTO";
  else if (weekNumber > 26 && weekNumber <= 39) phase = "ESPECIFICO";
  else if (weekNumber > 39) phase = "PERFORMANCE";

  // Lógica de intercalação sugerida:
  // Ter/Qui/Sáb: Corrida
  // Seg/Qua/Sex: Fortalecimento
  // Dom: Descanso

  if (isTuesday(date) || isThursday(date) || isSaturday(date)) {
    return {
      type: "RUNNING",
      title: isSaturday(date) ? "Rodagem Longa" : "Treino de Corrida",
      description: isSaturday(date) 
        ? "Foco em volume e resistência aeróbica." 
        : "Treino de ritmo ou intervalado conforme a fase.",
      phase,
      week: weekNumber,
    };
  }

  if (isMonday(date) || isWednesday(date) || isFriday(date)) {
    return {
      type: "STRENGTH",
      title: "Fortalecimento Específico",
      description: "Foco em estabilidade de core, glúteo médio e prevenção de lesões.",
      phase,
      week: weekNumber,
    };
  }

  return {
    type: "REST",
    title: "Recuperação Ativa / Descanso",
    description: "Dia de descanso total ou caminhada leve para recuperação muscular.",
    phase,
    week: weekNumber,
  };
}

/**
 * Calcula em qual semana do plano de 52 semanas o usuário está.
 */
export function calculateCurrentWeek(startDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.ceil(diffDays / 7);
  return Math.min(week, 52); // Limita a 52 semanas
}
