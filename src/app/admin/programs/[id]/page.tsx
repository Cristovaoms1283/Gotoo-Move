import prisma from "@/lib/db";
import Link from "next/link";
import { removeWorkoutFromProgram, createFichaForProgram, updateProgram } from "@/app/actions/programs";
import { addExercise, deleteExercise } from "@/app/actions/workouts";
import { Plus, Trash2, PlayCircle, Save } from "lucide-react";
import EditableExerciseRow from "@/components/EditableExerciseRow";

export default async function ProgramDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      workouts: {
        include: { 
          workout: {
            include: {
              exercises: { orderBy: { order: "asc" } }
            }
          } 
        },
        orderBy: { order: "asc" },
      }
    }
  });

  if (!program) return <div>Programa não encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/programs" className="text-zinc-500 hover:text-white text-sm">
            ← Voltar para listagem
          </Link>
          <h1 className="text-3xl font-black mt-2 italic uppercase">{program.title}</h1>
        </div>
        <Link 
          href={`/admin/programs/${program.id}/preview`}
          target="_blank"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition shadow-lg shadow-orange-500/20"
        >
          <PlayCircle size={20} />
          Visualizar como Aluno
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Navegação e Controles */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Configurações do Programa */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-lg font-bold mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Save size={18} className="text-primary" />
              Configurações
            </h3>
            <form action={async (formData) => {
              "use server";
              await updateProgram(id, formData);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Título</label>
                <input 
                  name="title" 
                  type="text" 
                  defaultValue={program.title}
                  required 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Descrição</label>
                <textarea 
                  name="description" 
                  defaultValue={program.description || ""}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Duração (Dias)</label>
                  <input 
                    name="durationDays" 
                    type="number" 
                    defaultValue={program.durationDays}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Objetivo Associado</label>
                <select 
                  name="goal" 
                  defaultValue={program.goal || ""}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 transition text-sm"
                >
                  <option value="">Nenhum objetivo específico</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Recomposição Corporal">Recomposição Corporal</option>
                  <option value="Tenho diabetes ou colesterol alto e hipertrofia">Diabetes/colesterol + hipertrofia</option>
                  <option value="Tenho diabetes e colesterol alto e emagrecimento">Diabetes/colesterol + emagrecimento</option>
                  <option value="Sou hipertenso e Hipertrofia">Hipertenso + hipertrofia</option>
                  <option value="Sou hipertenso e Emagrecimento">Hipertenso + emagrecimento</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">Alunos com este objetivo receberão este programa ativo automaticamente após o pagamento.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 text-sm rounded-lg transition"
              >
                Salvar Configurações
              </button>
            </form>
          </div>

          {/* Adicionar Nova Ficha */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 sticky top-8">
            <h3 className="text-lg font-bold mb-4 border-b border-zinc-800 pb-2">Nova Ficha</h3>
            <form action={async (formData) => {
              "use server";
              await createFichaForProgram(id, formData);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Nome da Ficha</label>
                <input 
                  name="label" 
                  type="text" 
                  required 
                  placeholder="Ex: Ficha A"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Ordem</label>
                <input 
                  name="order" 
                  type="number" 
                  defaultValue={program.workouts.length + 1}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-sm tracking-wider uppercase rounded-lg transition shadow-lg shadow-orange-500/20"
              >
                Adicionar Ficha
              </button>
            </form>
          </div>
        </div>

        {/* Listagem de Fichas e Exercícios no Programa */}
        <div className="lg:col-span-2 space-y-8">
          {program.workouts.length === 0 ? (
            <div className="bg-zinc-900/50 border border-dashed border-zinc-800 p-12 rounded-2xl text-center text-zinc-500">
              Nenhuma ficha adicionada a este programa ainda.
            </div>
          ) : (
            program.workouts.map((pw) => (
              <div key={pw.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header da Ficha */}
                <div className="bg-zinc-800/40 p-5 flex items-center justify-between border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 text-xl rounded-xl bg-orange-500 flex items-center justify-center text-white font-black italic shadow-lg shadow-orange-500/30">
                      {pw.label.replace("Ficha ", "")}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">{pw.label}</h4>
                      <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">{pw.workout.exercises.length} Exercícios</p>
                    </div>
                  </div>
                  <form action={async () => {
                    "use server";
                    await removeWorkoutFromProgram(pw.id, id);
                  }}>
                    <button title="Excluir Ficha Inteira" className="text-zinc-600 hover:text-red-500 bg-zinc-950 hover:bg-red-500/10 h-10 w-10 flex items-center justify-center rounded-xl transition">
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>

                {/* Lista de Exercícios da Ficha */}
                <div className="p-0">
                  <table className="w-full text-left bg-zinc-950/30">
                    <tbody className="divide-y divide-zinc-800/50">
                      {pw.workout.exercises.map((ex, index) => (
                        <EditableExerciseRow key={ex.id} exercise={ex} workoutId={pw.workoutId} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Formulário para adicionar exercício DIRETO NA FICHA */}
                <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
                  <form action={async (formData) => {
                    "use server";
                    await addExercise(pw.workoutId, formData);
                  }} className="flex flex-wrap items-center gap-2">
                    
                    <input required name="name" className="flex-1 min-w-[150px] bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white outline-none focus:border-orange-500 transition" placeholder="Exercício..." />
                    
                    <input name="sets" className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white text-center outline-none focus:border-orange-500 transition" placeholder="Sér." />
                    
                    <input name="reps" className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white text-center outline-none focus:border-orange-500 transition" placeholder="Rep" />

                    <input name="rest" className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white text-center outline-none focus:border-orange-500 transition" placeholder="Desc." />
                    
                    <select name="videoProvider" className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white outline-none focus:border-orange-500 transition">
                      <option value="youtube">YT</option>
                      <option value="pinterest">PIN</option>
                    </select>

                    <input required name="youtubeId" className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white outline-none focus:border-orange-500 transition" placeholder="ID Vídeo" />

                    <button type="submit" className="bg-zinc-100 hover:bg-white text-black font-bold p-2 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
