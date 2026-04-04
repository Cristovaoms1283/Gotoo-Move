import prisma from "@/lib/db";
import Link from "next/link";
import { PlayCircle, Clock, Award, ArrowRight, Calendar, Eye } from "lucide-react";
import WorkoutClientView from "@/components/WorkoutClientView";

export default async function ProgramPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sheet?: string }>;
}) {
  const { id } = await params;
  const { sheet } = await searchParams;

  const activeProgram = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      workouts: {
        include: {
          workout: {
            include: {
              exercises: { orderBy: { order: "asc" } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!activeProgram) {
    return (
      <main className="min-h-screen pt-24 pb-12 bg-black">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Programa não encontrado</h1>
          <Link href="/admin/programs" className="text-primary hover:underline font-bold">
            Voltar ao Admin
          </Link>
        </div>
      </main>
    );
  }

  const selectedWorkout = activeProgram.workouts.find((pw: any) => pw.id === sheet) || activeProgram.workouts[0];

  return (
    <main className="min-h-screen pt-12 pb-12 bg-black">
      {/* Banner de Preview */}
      <div className="fixed top-0 left-0 right-0 bg-orange-500 text-black text-center py-2 font-black uppercase text-xs tracking-widest z-50 flex items-center justify-center gap-2">
        <Eye className="h-4 w-4" />
        Modo de Visualização do Aluno
      </div>
      
      <div className="container mx-auto px-6 mt-12">
        {/* Cabeçalho do Programa */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link href={`/admin/programs/${id}`} className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-primary transition">
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Link>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Voltar para Edição</span>
            </div>
            
            <h1 className="text-4xl font-black italic tracking-tighter mb-2 uppercase leading-none">
              {activeProgram.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black italic">
                <Calendar className="h-3 w-3" />
                {activeProgram.durationDays} DIAS
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-white/40 text-xs font-medium">Ficha atual: <span className="text-white font-bold">{selectedWorkout?.label}</span></p>
            </div>
          </div>
        </header>

        {/* Seleção de Fichas estilo App (Pills) */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {activeProgram.workouts.map((pw: any) => (
            <Link 
              key={pw.id}
              href={`/admin/programs/${id}/preview?sheet=${pw.id}`}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-black italic uppercase text-xs transition-all duration-500 border-2 ${
                selectedWorkout?.id === pw.id 
                  ? 'bg-primary text-black border-primary shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)]' 
                  : 'bg-zinc-900 text-white/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {pw.label}
            </Link>
          ))}
        </div>

        {selectedWorkout ? (
          <WorkoutClientView workout={selectedWorkout.workout} selectedLabel={selectedWorkout.label} />
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-[40px] border border-dashed border-white/5">
            <div className="text-white/20 uppercase font-black tracking-widest text-sm">
              Nenhuma ficha adicionada
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
