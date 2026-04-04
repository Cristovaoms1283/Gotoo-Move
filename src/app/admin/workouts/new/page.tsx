import { createWorkout } from "@/app/actions/workouts";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function NewWorkout() {
  async function action(formData: FormData) {
    "use server";
    await createWorkout(formData);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/workouts" className="text-sm text-zinc-500 hover:text-white transition">
          ← Voltar para lista
        </Link>
        <h1 className="text-3xl font-bold mt-4">Novo Programa de Treino</h1>
      </div>

      <form action={action} className="space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Título do Programa</label>
          <input 
            name="title"
            required
            placeholder="Ex: Hipertrofia A - Peito e Tríceps"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Categoria</label>
          <select 
            name="category" 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
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
          <label className="text-sm font-medium text-zinc-400">Descrição (Opcional)</label>
          <textarea 
            name="description"
            rows={4}
            placeholder="Descreva o objetivo deste treino..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
        >
          Criar Programa de Treino
        </button>
      </form>

      <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <p className="text-sm text-orange-200">
          <strong>Dica:</strong> Após criar o programa, você será redirecionado para adicionar os exercícios específicos.
        </p>
      </div>
    </div>
  );
}
