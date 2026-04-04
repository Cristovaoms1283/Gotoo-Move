import { createRecipe } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/recipes" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Receitas
      </Link>

      <h1 className="text-3xl font-bold mb-8">Nova Receita Fitness</h1>

      <form action={createRecipe} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Título da Receita</label>
            <input 
              name="title" 
              type="text" 
              required 
              placeholder="Ex: Panqueca de Banana Fit"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <select
              name="category"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
            >
              <option value="pre-treino">⚡ Energia Pré-Treino</option>
              <option value="low-carb">🥩 Refeição Principal Low Carb</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Calorias (opcional)</label>
            <input 
              name="calories" 
              type="number" 
              placeholder="Ex: 250"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">URL da Imagem (opcional)</label>
            <input 
              name="imageUrl" 
              type="url" 
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ingredientes</label>
          <textarea 
            name="ingredients" 
            required 
            rows={5}
            placeholder="Lista de ingredientes..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Modo de Preparo</label>
          <textarea 
            name="instructions" 
            required 
            rows={8}
            placeholder="Passo a passo da receita..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition"
        >
          Salvar Receita
        </button>
      </form>
    </div>
  );
}
