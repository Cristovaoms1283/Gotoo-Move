"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addExercise } from "@/app/actions/workouts";
import { UploadButton } from "@/utils/uploadthing";

interface AddExerciseFormProps {
  workoutId: string;
}

export default function AddExerciseForm({ workoutId }: AddExerciseFormProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!videoUrl) {
      alert("Por favor, faça o upload do vídeo antes de salvar.");
      return;
    }

    // Adicionar a URL do vídeo ao formData antes de enviar
    formData.append("youtubeId", videoUrl);
    formData.append("videoProvider", "upload");

    try {
      await addExercise(workoutId, formData);
      // Limpar o estado do upload após sucesso
      setVideoUrl("");
      const form = document.getElementById("add-exercise-form") as HTMLFormElement;
      form?.reset();
    } catch (error: any) {
      alert(error.message || "Erro ao adicionar exercício.");
    }
  }

  return (
    <form
      id="add-exercise-form"
      action={handleSubmit}
      className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Nome do Exercício</label>
          <input
            required
            name="name"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition"
            placeholder="Ex: Supino Reto"
          />
        </div>
        <div className="flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer group bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg hover:border-orange-500/50 transition-all">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="isGironda" 
                  value="true"
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-white"></div>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-300 group-hover:text-orange-500 transition-colors uppercase">Metodologia Gironda</span>
                <p className="text-[9px] text-zinc-500 uppercase font-black italic tracking-widest">Protocolo 8x8 (30s Desc.)</p>
              </div>
            </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Séries</label>
          <input name="sets" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition" placeholder="3" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Reps</label>
          <input name="reps" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition" placeholder="12" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Descanso</label>
          <input name="rest" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition" placeholder="60s" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Vídeo de Demonstração (Upload do PC)</label>
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col items-center gap-3">
          {videoUrl ? (
            <div className="text-sm text-green-500 font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              Vídeo Carregado com Sucesso!
              <button
                type="button"
                onClick={() => setVideoUrl("")}
                className="text-xs text-zinc-500 hover:text-white underline ml-2"
              >
                Trocar Vídeo
              </button>
            </div>
          ) : (
            <UploadButton
              endpoint="workoutMedia"
              onUploadBegin={() => setIsUploading(true)}
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setVideoUrl(res[0].url);
                  setIsUploading(false);
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Erro no upload: ${error.message}`);
                setIsUploading(false);
              }}
              appearance={{
                button: "bg-orange-500 hover:bg-orange-600 text-black font-black py-2 px-6 rounded-lg transition-all uppercase tracking-tighter italic",
                allowedContent: "text-[10px] text-zinc-500"
              }}
              content={{
                button({ ready }) {
                  if (ready) return "Selecionar Vídeo (MAX 32MB)";
                  return "Preparando...";
                },
                allowedContent: "Apenas vídeos e imagens de alta qualidade"
              }}
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Observações Técnicas</label>
        <input name="description" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition" placeholder="Mantenha a coluna reta..." />
      </div>

      <button
        type="submit"
        disabled={isUploading || !videoUrl}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        Adicionar Exercício
      </button>
    </form>
  );
}
