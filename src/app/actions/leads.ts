"use server";

import prisma from "@/lib/db";
import { resend } from "@/lib/resend";
import crypto from "crypto";

export async function registerLead(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const whatsapp = formData.get("whatsapp") as string;

  if (!name || !email || !whatsapp) {
    return { success: false, error: "Todos os campos são obrigatórios." };
  }

  try {
    // Verificar se já existe um lead com este e-mail
    const existingLead = await prisma.lead.findUnique({
      where: { email },
    });

    if (existingLead && existingLead.isConfirmed) {
      return { success: false, error: "Este e-mail já confirmou a aula experimental anteriormente." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Salvar ou atualizar o lead
    await prisma.lead.upsert({
      where: { email },
      update: {
        name,
        whatsapp,
        token,
        expiresAt,
        isConfirmed: false,
      },
      create: {
        name,
        email,
        whatsapp,
        token,
        expiresAt,
      },
    });

    // Enviar e-mail via Resend
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/leads/confirm?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'FitConnect <onboarding@resend.dev>', // Em produção, usar seu domínio
      to: [email],
      subject: '🔥 Libere sua Aula Experimental de Treinamento Funcional!',
      html: `
        <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; text-align: center; border-radius: 20px;">
          <h1 style="font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: -2px; margin-bottom: 20px;">
            GOTO <span style="color: #3b82f6;">MOVE</span>
          </h1>
          
          <p style="font-size: 18px; color: #a1a1aa; margin-bottom: 30px;">
            Olá, <strong>${name}</strong>! <br>
            Você está a um passo de transformar seu corpo com nosso treinamento funcional.
          </p>

          <div style="background-color: #18181b; border: 1px solid #27272a; padding: 30px; border-radius: 16px; margin-bottom: 30px;">
            <p style="font-size: 14px; color: #71717a; margin-bottom: 20px; line-height: 1.6;">
              Clique no botão abaixo para confirmar seu acesso e liberar sua <strong>Aula Experimental Grátis</strong> imediata.
            </p>
            
            <a href="${confirmLink}" style="display: inline-block; background-color: #fff; color: #000; padding: 16px 32px; border-radius: 12px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
              Liberar Minha Aula Agora
            </a>
          </div>

          <p style="font-size: 13px; color: #52525b; line-height: 1.5; margin-bottom: 30px;">
            *Esta confirmação libera exclusivamente a Aula Experimental de Funcional. <br>
            Ao finalizar a aula, você terá uma condição especial para assinar o plano completo.
          </p>

          <hr style="border: 0; border-top: 1px solid #27272a; margin-bottom: 30px;">

          <p style="font-size: 11px; color: #3f3f46;">
            &copy; 2026 Gotoo Move | Studio Fitness.
          </p>
        </div>
      `
    });

    if (error) {
      console.error("Erro Resend:", error);
      // Se falhar o envio de e-mail por restrição de conta (ex: domínio não verificado),
      // ainda assim consideramos o lead criado como "pendente" para o ADM não perdê-lo.
      return { 
        success: true, 
        warning: "Lead registrado! Porém, o e-mail de confirmação não pôde ser enviado no momento (verifique a configuração do seu domínio no Resend)." 
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro ao registrar lead:", err);
    return { success: false, error: "Erro interno no servidor." };
  }
}
