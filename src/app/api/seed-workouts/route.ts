import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const GOALS = [
  "Hipertrofia",
  "Emagrecimento",
  "Tenho diabetes ou colesterol alto e hipertrofia",
  "Sou hipertenso e Emagrecimento"
];

// Base de Exercícios por Grupo
const EXERCISE_DB: Record<string, {name: string, youtubeId: string}[]> = {
  peito: [
    { name: "Supino Reto com Barra", youtubeId: "sqOw2Y6uDWQ" },
    { name: "Supino Inclinado com Halteres", youtubeId: "8iPEnn-ltC8" },
    { name: "Crucifixo Reto", youtubeId: "eOzVjsA52xk" },
    { name: "Crossover Polia Alta", youtubeId: "taI4XduLpTk" },
    { name: "Voador (Peck Deck)", youtubeId: "Z5ZAwjKgZFM" },
    { name: "Flexão de Braço", youtubeId: "IODxDxX7oi4" },
    { name: "Supino Declinado", youtubeId: "LfyQBUKR8SE" }
  ],
  costas: [
    { name: "Puxada Frontal (Pulley)", youtubeId: "CAO1z0cN-A8" },
    { name: "Remada Curvada com Barra", youtubeId: "vT2GjY_Umpw" },
    { name: "Remada Baixa Polia", youtubeId: "GZbfZ033f74" },
    { name: "Remada Unilateral (Serrote)", youtubeId: "pYcpY20QaE8" },
    { name: "Puxada Articulada", youtubeId: "8v_Wj5YnUjQ" },
    { name: "Crucifixo Inverso no Voador", youtubeId: "5o11b71x-rY" },
    { name: "Pulldown com Corda", youtubeId: "7O7gZJ8wWpA" }
  ],
  ombro: [
    { name: "Desenvolvimento com Halteres", youtubeId: "qEwKCR5JCog" },
    { name: "Elevação Lateral com Halteres", youtubeId: "3VcKaXpzqRo" },
    { name: "Elevação Frontal com Polia", youtubeId: "-t7fuZ0KhDA" },
    { name: "Desenvolvimento Máquina", youtubeId: "Wvc8b1XmE0E" },
    { name: "Crucifixo Invertido Halteres", youtubeId: "WJm9T2PuzCc" },
    { name: "Remada Alta", youtubeId: "LpXv_aB_tU0" }
  ],
  biceps: [
    { name: "Rosca Direta com Barra", youtubeId: "kwG2ipFRgfo" },
    { name: "Rosca Alternada com Halteres", youtubeId: "sAq_ocpRh_I" },
    { name: "Rosca Scott Máquina", youtubeId: "0WOP9J7QPjw" },
    { name: "Rosca Martelo", youtubeId: "zC3nLlEvin4" },
    { name: "Rosca Concentrada", youtubeId: "Jvj2wV0IQc8" }
  ],
  triceps: [
    { name: "Tríceps Pulley", youtubeId: "2-LAMcpzODU" },
    { name: "Tríceps Testa com Barra", youtubeId: "d_KZxk3_kd8" },
    { name: "Tríceps Francês Unilateral", youtubeId: "q5qFXXzBQJc" },
    { name: "Tríceps Corda", youtubeId: "vB5OHsJ3EME" },
    { name: "Mergulho na Máquina/Banco", youtubeId: "0326dy_-EXw" }
  ],
  quadriceps: [
    { name: "Agachamento Livre", youtubeId: "bEv6CCg2BC8" },
    { name: "Leg Press 45", youtubeId: "IZxyjW7OSvc" },
    { name: "Cadeira Extensora", youtubeId: "YyvSfVjQeL0" },
    { name: "Agachamento Hack", youtubeId: "0tn5K9NlCfo" },
    { name: "Passada / Afundo", youtubeId: "D7KaRcUTQeE" },
    { name: "Agachamento Búlgaro", youtubeId: "1CvEskVcznA" }
  ],
  posterior: [
    { name: "Mesa Flexora", youtubeId: "1Tq3QdFxEE0" },
    { name: "Cadeira Flexora", youtubeId: "F488k67BTig" },
    { name: "Stiff com Halteres", youtubeId: "0_FALLyPeWs" },
    { name: "Stiff com Barra", youtubeId: "c_lG11zT4Xw" },
    { name: "Levantamento Terra", youtubeId: "op9kVnSso6Q" }
  ],
  gluteos: [
    { name: "Elevação Pélvica", youtubeId: "Wc8sK6B9kC8" },
    { name: "Cadeira Abdutora", youtubeId: "eYyD3sZ8z4s" },
    { name: "Glúteo na Polia", youtubeId: "2c-E6Xj1tF8" },
    { name: "Glúteo 4 Apoios", youtubeId: "5jM6-X-O2E4" }
  ],
  panturrilhas: [
    { name: "Panturrilhas em Pé", youtubeId: "-M4-G8p8fmc" },
    { name: "Panturrilhas no Leg Press", youtubeId: "5b5p0Qf0bH4" },
    { name: "Cadeira Sóleo (Sentado)", youtubeId: "x13C2j6h3mY" }
  ],
  abdomen: [
    { name: "Abdominal Supra", youtubeId: "1919eTCoGQ" },
    { name: "Abdominal Infra no Banco", youtubeId: "L2MtbXN0p-I" },
    { name: "Prancha Isométrica", youtubeId: "ASdvN_XEl_c" },
    { name: "Abdominal Máquina", youtubeId: "s1W8L5dHQ6I" },
    { name: "Russian Twist", youtubeId: "wkD8rjkodUI" }
  ],
  aerobico: [
    { name: "Esteira (Intenso / HIIT)", youtubeId: "M-XbB-gN38U" },
    { name: "Caminhada Moderada", youtubeId: "M-XbB-gN38U" },
    { name: "Bicicleta Ergométrica", youtubeId: "M-XbB-gN38U" },
    { name: "Transport/Elíptico", youtubeId: "M-XbB-gN38U" }
  ]
};

function pickN(arr: any[], n: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const splits = {
  ABC: [
    { label: "Ficha A", groups: ["peito", "ombro", "triceps", "abdomen"] },
    { label: "Ficha B", groups: ["costas", "biceps", "aerobico"] },
    { label: "Ficha C", groups: ["quadriceps", "posterior", "gluteos", "panturrilhas"] }
  ],
  ABCD: [
    { label: "Ficha A", groups: ["peito", "triceps", "abdomen"] },
    { label: "Ficha B", groups: ["costas", "biceps", "aerobico"] },
    { label: "Ficha C", groups: ["quadriceps", "panturrilhas"] },
    { label: "Ficha D", groups: ["ombro", "posterior", "gluteos", "abdomen"] }
  ],
  ABCDE: [
    { label: "Ficha A", groups: ["peito", "abdomen"] },
    { label: "Ficha B", groups: ["costas", "panturrilhas"] },
    { label: "Ficha C", groups: ["quadriceps", "aerobico"] },
    { label: "Ficha D", groups: ["ombro", "triceps", "biceps"] },
    { label: "Ficha E", groups: ["posterior", "gluteos", "abdomen"] }
  ]
};

export async function POST(req: Request) {
  try {
    console.log("Deletando antigos Programs...");
    await prisma.trainingProgram.deleteMany();

    const output = [];

    for (const goal of GOALS) {
      for (let month = 1; month <= 12; month++) {
        let phaseName = "";
        let splitType: "ABC" | "ABCD" | "ABCDE" = "ABC";
        let repScheme = "3 x 10 a 12";
        let restTime = "60s";

        if (month <= 2) {
          phaseName = "Adaptação e Base";
          splitType = "ABC";
          repScheme = "3 x 12 a 15";
          restTime = "90s";
        } else if (month <= 5) {
          phaseName = "Hipertrofia Funcional";
          splitType = "ABCD";
          repScheme = "4 x 8 a 12";
          restTime = "60s";
        } else if (month <= 8) {
          phaseName = "Força e Tensão";
          splitType = "ABCDE";
          repScheme = "4 x 6 a 10";
          restTime = "90s";
        } else {
          phaseName = "Metabólico / Intensificação";
          splitType = "ABCDE";
          repScheme = "3 x 12 a 15 (Bi-sets)";
          restTime = "45s";
        }

        if (goal === "Emagrecimento") {
          repScheme = month > 6 ? "4 x 15 (Bi-set)" : "3 x 15 a 20";
          restTime = "45s";
          if (month <= 6) splitType = "ABCD";
        } else if (goal.includes("hipertenso")) {
          repScheme = "3 x 15"; 
          restTime = "90s";     
          splitType = month % 2 === 0 ? "ABCD" : "ABC"; 
        } else if (goal.includes("diabetes")) {
          repScheme = "3 x 12 a 15";
          restTime = "60s";
          splitType = "ABCD"; 
        }

        const programTitle = `Mês ${month}: ${phaseName} (${goal.split(' ')[0]})`;
        output.push(`Criando: ${programTitle} - Divisão: ${splitType}`);
        
        const trainingProgram = await prisma.trainingProgram.create({
          data: {
            title: programTitle,
            description: `Treino de Periodização Anual - Mês ${month}. Foco: ${phaseName}. Divisão: ${splitType}. Duração Média: 55 min.`,
            durationDays: 30,
            goal: goal,
          }
        });

        const currentSplit = splits[splitType];
        
        for (let i = 0; i < currentSplit.length; i++) {
          const ficha = currentSplit[i];
          
          const workout = await prisma.workout.create({
            data: {
              title: `${programTitle} - ${ficha.label}`,
              category: goal.split(' ')[0], 
              description: `Treinos de ${ficha.groups.join(', ')}`
            }
          });

          let targetExercises = 9; 
          let exercisesToCreate: any[] = [];
          let order = 1;

          for (const g of ficha.groups) {
            const exercisesFromGroup = EXERCISE_DB[g] || [];
            const amount = Math.max(2, Math.floor(targetExercises / ficha.groups.length));
            const picked = pickN(exercisesFromGroup, amount);
            
            for (const ex of picked) {
              exercisesToCreate.push({
                workoutId: workout.id,
                name: ex.name,
                youtubeId: ex.youtubeId || "M-XbB-gN38U",
                videoProvider: "youtube",
                sets: repScheme.split(' x ')[0] || "3",
                reps: repScheme.split(' x ')[1] || "12",
                rest: restTime,
                order: order++
              });
            }
          }
          
          if (exercisesToCreate.length < 9) {
            const firstGroup = ficha.groups[0];
            const extra = pickN(EXERCISE_DB[firstGroup] || [], Math.max(0, 9 - exercisesToCreate.length));
            for (const ex of extra) {
               exercisesToCreate.push({
                workoutId: workout.id,
                name: ex.name + " (Variante)",
                youtubeId: ex.youtubeId || "M-XbB-gN38U",
                videoProvider: "youtube",
                sets: repScheme.split(' x ')[0] || "3",
                reps: repScheme.split(' x ')[1] || "12",
                rest: restTime,
                order: order++
              });
            }
          }

          // Inserir os exercícios
          await prisma.exercise.createMany({
            data: exercisesToCreate
          });

          await prisma.programWorkout.create({
            data: {
              programId: trainingProgram.id,
              workoutId: workout.id,
              label: ficha.label,
              order: i
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, programsGenerated: output });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
