import { createNutrition } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewNutritionPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/nutrition" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Alimentação
      </Link>

      <h1 className="text-3xl font-bold mb-8">Nova Dica de Alimentação</h1>

      <form action={createNutrition} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <select
            name="category"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          >
            <option value="horarios">🕐 Horários e Timing de Refeições</option>
            <option value="alimentos">🥦 Impacto dos Alimentos no Treino</option>
            <option value="glicemico">📊 Índice Glicêmico e Saúde</option>
            <option value="noticias">📰 Ciência e Notícias sobre Nutrição</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Título da Dica</label>
          <input
            name="title"
            type="text"
            required
            placeholder="Ex: A janela anabólica: o que a ciência diz"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Conteúdo</label>
          <textarea
            name="content"
            required
            rows={10}
            placeholder="Escreva aqui as orientações nutricionais..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Salvar Dica
        </button>
      </form>
    </div>
  );
}
