"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateHomeWorkout } from "@/app/actions/home-workouts";
import { Save } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";

export default function EditWorkoutForm({ workout }: { workout: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(workout.youtubeId || "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      instructor: formData.get("instructor") as string,
      level: formData.get("level") as string,
      calories: formData.get("calories") as string,
      youtubeId: videoUrl,
      order: Number(formData.get("order")) || 0,
    };

    const result = await updateHomeWorkout(workout.id, data);
    
    if (result?.success) {
      router.push("/admin/home-workouts");
    } else {
      alert("Erro ao atualizar vídeo. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
      <div className="space-y-2">
        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Título da Aula
        </label>
        <input
          name="title"
          required
          defaultValue={workout.title}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Instrutor
          </label>
          <input
            name="instructor"
            required
            defaultValue={workout.instructor}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Vídeo da Aula
            </label>
            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
               <button 
                type="button"
                onClick={() => setVideoUrl(workout.youtubeId || "")}
                className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition ${!videoUrl.startsWith('http') ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                YouTube
               </button>
               <button 
                type="button"
                onClick={() => setVideoUrl("")}
                className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition ${videoUrl.startsWith('http') ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                Upload
               </button>
            </div>
          </div>
          
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col gap-4">
            {videoUrl && videoUrl.startsWith("http") ? (
              <div className="space-y-3">
                <div className="text-sm text-green-500 font-bold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  Vídeo Local (UploadThing)
                </div>
                <button 
                  type="button" 
                  onClick={() => setVideoUrl("")}
                  className="text-xs text-zinc-500 hover:text-white underline"
                >
                  Remover Upload e usar YouTube
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Fazer Upload do Arquivo:</label>
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
                      button: "bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold py-2 px-6 rounded-lg transition-all",
                      allowedContent: "hidden"
                    }}
                  />
                </div>
                
                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Ou Link/ID do YouTube:</label>
                  <input
                    type="text"
                    value={videoUrl.startsWith('http') ? '' : videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Ex: dQw4w9WgXcQ ou link completo"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Nível
          </label>
          <input
            name="level"
            required
            defaultValue={workout.level}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Calorias (Gasto)
          </label>
          <input
            name="calories"
            required
            defaultValue={workout.calories}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
          Ordem de Exibição
        </label>
        <input
          name="order"
          type="number"
          defaultValue={workout.order}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading || isUploading || !videoUrl}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
      >
        {loading ? "Salvando..." : (
          <>
            <Save className="h-5 w-5" />
            Salvar Alterações
          </>
        )}
      </button>
    </form>
  );
}
