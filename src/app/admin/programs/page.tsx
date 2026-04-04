import prisma from "@/lib/db";
import Link from "next/link";
import { deleteProgram, duplicateProgram } from "@/app/actions/programs";

export default async function AdminPrograms() {
  const programs = await prisma.trainingProgram.findMany({
    include: { _count: { select: { workouts: true, users: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Programas</h1>
        <Link 
          href="/admin/programs/new"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Novo Programa
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-sm">
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Objetivo</th>
              <th className="px-6 py-4">Duração</th>
              <th className="px-6 py-4">Fichas</th>
              <th className="px-6 py-4">Alunos</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  Nenhum programa cadastrado ainda.
                </td>
              </tr>
            ) : (
              programs.map((program) => (
                <tr key={program.id} className="hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 font-medium">{program.title}</td>
                  <td className="px-6 py-4">
                    {program.goal ? (
                      <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {program.goal}
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {program.durationDays} dias
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {program._count.workouts} fichas
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {program._count.users} ativos
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <Link 
                      href={`/admin/programs/${program.id}`}
                      className="text-orange-500 hover:text-orange-400 text-sm font-bold uppercase transition"
                    >
                      Editar Fichas
                    </Link>
                    <form action={async () => {
                      "use server";
                      await duplicateProgram(program.id);
                    }} className="inline">
                      <button className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition">
                        Duplicar
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await deleteProgram(program.id);
                    }} className="inline">
                      <button className="text-zinc-600 hover:text-red-500 text-sm font-medium transition">
                        Excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
