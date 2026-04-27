import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // O Token de Verificação deve ser o mesmo configurado no Painel do Desenvolvedor do Facebook
  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "fitconnect_leads_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Log para depuração (pode ser removido após homologação)
    console.log("🔔 Webhook Meta Recebido:", JSON.stringify(body, null, 2));

    // O Facebook envia um array de mudanças
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    
    if (changes?.field === "leadgen") {
      const leadId = changes.value.leadgen_id;
      const pageId = changes.value.page_id;
      
      // Aqui, o ideal seria fazer um fetch na API do Facebook para pegar os campos do lead
      // usando o leadId e um Access Token de Página.
      // Por agora, vamos criar um registro de "Captura Automática" que o admin pode ver.
      
      /* 
      Nota: Para pegar o Nome/Email/WhatsApp real via API, é necessário:
      1. Access Token de Página com permissão leads_retrieval
      2. GET https://graph.facebook.com/v19.0/{leadId}
      */

      // Simulando a captura de um lead que acabou de entrar
      // (Em produção, aqui entraria a chamada à API do Facebook)
      
      console.log(`Lead ID ${leadId} detectado na página ${pageId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro no Webhook Meta:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
