import { getHomeWorkoutById } from "@/app/actions/home-workouts";
import EditWorkoutForm from "./EditWorkoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditHomeWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const workout = await getHomeWorkoutById(resolvedParams.id);

  if (!workout) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin/home-workouts"
          className="p-2 hover:bg-zinc-800 rounded-lg transition"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Treino em Casa</h1>
          <p className="text-zinc-400">Modifique os detalhes da aula abaixo.</p>
        </div>
      </div>

      <EditWorkoutForm workout={workout} />
    </div>
  );
}
