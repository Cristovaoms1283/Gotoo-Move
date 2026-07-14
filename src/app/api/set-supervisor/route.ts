import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  const secret = url.searchParams.get('secret');

  if (secret !== 'gotomove2026') {
    return NextResponse.json({ success: false, message: 'Acesso negado.' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ success: false, message: 'Forneça o email.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'supervisor' }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${user.name} (${user.email}) promovido para Supervisor com sucesso!` 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao promover usuário. Verifique se o e-mail está cadastrado.',
      error: error?.message 
    }, { status: 500 });
  }
}
