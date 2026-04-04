import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { token },
    });

    if (!lead) {
      console.error(`Link de lead não encontrado para o token: ${token?.substring(0, 8)}...`);
      return NextResponse.redirect(new URL("/?error=token_nao_encontrado", req.url));
    }

    if (lead.expiresAt < new Date()) {
      console.error(`Link de lead expirado. Expira em: ${lead.expiresAt}, Agora: ${new Date()}`);
      return NextResponse.redirect(new URL("/?error=token_expirado", req.url));
    }

    // Marcar como confirmado
    await prisma.lead.update({
      where: { id: lead.id },
      data: { isConfirmed: true },
    });

    // Definir cookie de acesso à aula experimental (válido por 7 dias)
    const cookieStore = await cookies();
    cookieStore.set("fitconnect_lead_token", token, {
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // Redirecionar para a página de treinos em casa com parâmetro de sucesso
    return NextResponse.redirect(new URL("/treino-em-casa?lead_access=granted", req.url));
  } catch (error) {
    console.error("Erro na confirmação do lead:", error);
    return NextResponse.redirect(new URL("/?error=server_error", req.url));
  }
}
