import prisma from "@/lib/db";
import { assignProgramToUser } from "@/app/actions/programs";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: { activeProgram: true },
    orderBy: { createdAt: "desc" },
  });

  const programs = await prisma.trainingProgram.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Alunos</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-sm">
              <th className="px-6 py-4">Nome/Email</th>
              <th className="px-6 py-4">Programa Atual</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                <td className="px-6 py-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-zinc-500 text-xs">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.activeProgram ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {user.activeProgram?.title || "Nenhum programa"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async (formData) => {
                    "use server";
                    const progId = formData.get("programId") as string;
                    await assignProgramToUser(user.id, progId === "none" ? null : progId);
                  }} className="flex items-center justify-end gap-2">
                    <select 
                      name="programId"
                      defaultValue={user.activeProgramId || "none"}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="none">Retirar Programa</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    <button type="submit" className="bg-zinc-100 hover:bg-white text-black text-xs font-bold px-3 py-1 rounded transition">
                      Salvar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
