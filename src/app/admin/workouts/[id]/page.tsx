import { getWorkoutById } from "@/lib/data";
import { updateWorkout, addExercise, deleteExercise } from "@/app/actions/workouts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, Trash2, Plus } from "lucide-react";
import EditableExerciseRow from "@/components/EditableExerciseRow";
import AddExerciseForm from "@/components/AddExerciseForm";

export default async function EditWorkout(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const workout = await getWorkoutById(params.id);

  if (!workout) {
    console.log(`[ADMIN_EDIT] Workout not found for ID: ${params.id}`);
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/workouts" className="text-sm text-zinc-500 hover:text-white transition">
            ← Voltar para lista
          </Link>
          <h1 className="text-3xl font-bold mt-2 italic uppercase">Editar Programa</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lado Esquerdo: Dados do Treino */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-2">Informações Gerais</h2>
          <form action={async (formData) => {
            "use server";
            await updateWorkout(params.id, formData);
          }} className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Título</label>
              <input 
                name="title"
                defaultValue={workout.title}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Categoria</label>
              <select 
                name="category"
                defaultValue={workout.category || "Hipertrofia"}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-orange-500 transition"
              >
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Emagrecimento">Emagrecimento</option>
                <option value="Recomposição Corporal">Recomposição Corporal</option>
                <option value="Tenho diabetes ou colesterol alto e hipertrofia">Tenho diabetes ou colesterol alto e hipertrofia</option>
                <option value="Tenho diabetes e colesterol alto e emagrecimento">Tenho diabetes e colesterol alto e emagrecimento</option>
                <option value="Sou hipertenso e Hipertrofia">Sou hipertenso e Hipertrofia</option>
                <option value="Sou hipertenso e Emagrecimento">Sou hipertenso e Emagrecimento</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Descrição</label>
              <textarea 
                name="description"
                rows={3}
                defaultValue={workout.description || ""}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
              />
            </div>
            <button type="submit" className="w-full btn-premium btn-primary py-3 rounded-lg text-sm font-bold uppercase tracking-wider">
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Lado Direito: Adicionar Exercício */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-2">Novo Exercício</h2>
          <AddExerciseForm workoutId={params.id} />
        </div>
      </div>

      {/* Lista de Exercícios Atual - Estilo Tabela MFIT */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black italic border-b border-zinc-800 pb-4 uppercase tracking-tighter flex items-center gap-3">
          <PlayCircle className="text-orange-500" />
          Ordem dos Exercícios ({workout.exercises.length})
        </h2>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Exercício</th>
                <th className="px-6 py-4 text-center">Séries</th>
                <th className="px-6 py-4 text-center">Reps</th>
                <th className="px-6 py-4 text-center">Descanso</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {workout.exercises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                    Nenhum exercício cadastrado.
                  </td>
                </tr>
              ) : (
                workout.exercises.map((exercise, index) => (
                  <EditableExerciseRow key={exercise.id} exercise={exercise} workoutId={params.id} index={index} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
