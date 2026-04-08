import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const KMS = ["3km", "5km", "10km", "21km", "42km"];
const MONTHS = 12;

function getPhaseTitle(month: number): string {
    if (month >= 1 && month <= 3) return "Base: Resistência Aeróbica (Z2)";
    if (month >= 4 && month <= 6) return "Fortalecimento: VO2 Máx & Limiar de Lactato";
    if (month >= 7 && month <= 9) return "Velocidade: Simulados e Especificidade";
    if (month >= 10 && month <= 12) return "Performance: Polimento e Prova Alvo (RP)";
    return "Fase Desconhecida";
}

function getPhaseDescription(distance: string, month: number): string {
    if (month >= 1 && month <= 3) return `Construção sólida de base para ${distance}. Foco em trote moderado, respiração rítmica e ganho de tempo de perna.`;
    if (month >= 4 && month <= 6) return `Treinos intervalados de alta intensidade (HIIT c/ Corrida). Adaptação forte para sustentar ritmo em ${distance}.`;
    if (month >= 7 && month <= 9) return `Treinos idênticos ao ritmo de prova. Você fará simulados e testará sua hidratação e estratégia de passadas para ${distance}.`;
    if (month >= 10 && month <= 12) return `Polimento pré-prova! Redução estratégica do volume para garantir Pico de Performance e Recorde Pessoal no ${distance}.`;
    return "";
}

async function run() {
    console.log("Iniciando Seed de Periodização Anual da Corrida (12 Meses)...");
    
    // Desvincular usuários que estão em treinos de corrida antigos para evitar violações de foreign key
    const runningPrograms = await prisma.trainingProgram.findMany({
        where: { category: "RUNNING" },
        select: { id: true }
    });
    
    const runningProgramIds = runningPrograms.map(p => p.id);

    if (runningProgramIds.length > 0) {
        console.log("Desvinculando usuários antigos das planilhas antigas...");
        await prisma.user.updateMany({
            where: { activeProgramId: { in: runningProgramIds } },
            data: { activeProgramId: null }
        });
        
        // Deletar APENAS os treinos antigos da categoria RUNNING
        console.log("Apagando planilhas de RUNNING antigas...");
        await prisma.trainingProgram.deleteMany({
            where: { category: "RUNNING" }
        });
    }

    // 1. Geração dos Workouts BASE (Fichas Genéricas que serão reutilizadas)
    console.log(`\n🏋️  Garantindo a existência das Fichas Base de Corrida...`);
    
    const baseWorkouts = [
      { title: "🏃 Treinos da Planilha de Corrida", desc: "Verifique o tempo e a quilometragem na tabela da sua etapa.", category: "RUNNING" },
      { title: "💪 Fortalecimento Físico", desc: "Série para prevenir lesões e fortalecer o core e as pernas (Seg/Qua/Sex).", category: "STRENGTH" },
      { title: "🧘 Recuperação e Alongamento", desc: "Dia de descanso ou recuperação ativa com liberação miofascial (Dom).", category: "RECOVERY" }
    ];
  
    const dbWorkouts = [];
    for (const w of baseWorkouts) {
      let workout = await prisma.workout.findFirst({ where: { title: w.title, category: w.category } });
      if (!workout) {
        workout = await prisma.workout.create({
          data: {
            title: w.title,
            description: w.desc,
            category: w.category
          }
        });
        console.log(`✅ Criada Ficha Master: ${w.title}`);
      }
      dbWorkouts.push(workout);
    }
  
    const [fichaCorrida, fichaFortalecimento, fichaMobilidade] = dbWorkouts;

    // Criar as planilhas para cada distância
    for (const km of KMS) {
        console.log(`\n>>> Gerando Ciclo de 12 Meses para: ${km} <<<`);
        
        for (let month = 1; month <= MONTHS; month++) {
            const title = `Programa Corrida ${km} - Mês ${month}`;
            const description = getPhaseTitle(month) + " | " + getPhaseDescription(km, month);

            const tp = await prisma.trainingProgram.create({
                data: {
                    title: title,
                    description: description,
                    goal: "PERFORMANCE", 
                    category: "RUNNING",
                    subcategory: km,
                    level: "Iniciante/Intermediário",
                    month: month,
                    durationDays: 30, // Representa 1 mês exato
                }
            });

            // ANEXAR AS 3 FICHAS AO PROGRAMA RECÉM CRIADO
            await prisma.programWorkout.createMany({
              data: [
                { programId: tp.id, workoutId: fichaCorrida.id, label: "Corrida Específica", order: 1 },
                { programId: tp.id, workoutId: fichaFortalecimento.id, label: "Fortalecimento", order: 2 },
                { programId: tp.id, workoutId: fichaMobilidade.id, label: "Dia Off / Mobilidade", order: 3 }
              ]
            });
        }
    }

    console.log("\nSeed completo e otimizado! O Banco de Dados agora suporta os 12 ciclos do Stripe!");
}

run()
.catch(e => {
    console.error(e);
})
.finally(async () => {
    await prisma.$disconnect();
});
