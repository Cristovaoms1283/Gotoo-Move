import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardHubPage() {
  const clerkUser = await currentUser();
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4 uppercase italic tracking-tighter">
        Ambiente de <span className="text-primary">Produção</span>
      </h1>
      <div className="glass p-8 rounded-3xl border border-white/10 max-w-lg w-full">
        <p className="text-xl mb-6">Teste de Conectividade</p>
        <div className="space-y-4 text-left font-mono text-sm">
          <p className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/40">Status Usuário:</span>
            <span className="text-green-400">{clerkUser ? "Autenticado" : "Erro Autenticação"}</span>
          </p>
          <p className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/40">E-mail:</span>
            <span>{clerkUser?.emailAddresses[0]?.emailAddress || "N/A"}</span>
          </p>
        </div>
        <div className="mt-8">
            <Link href="/" className="btn-premium btn-primary px-8 py-3 rounded-full">
                Voltar ao Início
            </Link>
        </div>
      </div>
      <p className="mt-8 text-white/20 text-[10px] uppercase tracking-widest font-bold">
        Se você vê esta tela, o erro de 500 original foi isolado!
      </p>
    </div>
  );
}
