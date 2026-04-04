import { createProgram } from "@/app/actions/programs";
import Link from "next/link";

export default function NewProgram() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/programs" className="text-zinc-500 hover:text-white text-sm">
          ← Voltar para listagem
        </Link>
        <h1 className="text-3xl font-bold mt-2">Novo Programa de Treinamento</h1>
      </div>

      <form action={createProgram} className="space-y-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Título do Programa</label>
          <input 
            name="title" 
            type="text" 
            required 
            placeholder="Ex: Hipertrofia Masculina - Nível 1"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição</label>
          <textarea 
            name="description" 
            rows={4}
            placeholder="Descreva os objetivos do programa..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Duração (Dias)</label>
          <input 
            name="durationDays" 
            type="number" 
            defaultValue={30}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Objetivo (Opcional)</label>
          <select 
            name="goal" 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            <option value="">Nenhum objetivo específico</option>
            <option value="Hipertrofia">Hipertrofia</option>
            <option value="Emagrecimento">Emagrecimento</option>
            <option value="Recomposição Corporal">Recomposição Corporal</option>
            <option value="Tenho diabetes ou colesterol alto e hipertrofia">Tenho diabetes ou colesterol alto e hipertrofia</option>
            <option value="Tenho diabetes e colesterol alto e emagrecimento">Tenho diabetes e colesterol alto e emagrecimento</option>
            <option value="Sou hipertenso e Hipertrofia">Sou hipertenso e Hipertrofia</option>
            <option value="Sou hipertenso e Emagrecimento">Sou hipertenso e Emagrecimento</option>
          </select>
        </div>

        <button 
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
        >
          Criar Programa e Adicionar Fichas
        </button>
      </form>
    </div>
  );
}
