import { createTip } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTipPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/tips" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Dicas
      </Link>

      <h1 className="text-3xl font-bold mb-8">Nova Dica de Treino</h1>

      <form action={createTip} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <select
            name="category"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          >
            <option value="musculacao">🏋️ Musculação / Academia</option>
            <option value="casa">🏠 Treino em Casa / Funcional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Título da Dica</label>
          <input 
            name="title" 
            type="text" 
            required 
            placeholder="Ex: Como melhorar sua execução no agachamento"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Conteúdo</label>
          <textarea 
            name="content" 
            required 
            rows={10}
            placeholder="Escreva aqui os detalhes da dica..."
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
