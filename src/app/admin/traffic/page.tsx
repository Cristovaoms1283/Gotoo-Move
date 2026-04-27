// Central de Tráfego - Server Component Real
import prisma from "@/lib/db";
import TrafficDashboardClient from "./components/TrafficDashboardClient";

export const dynamic = "force-dynamic";

export default async function TrafficCenterPage() {
  // 1. Buscar Leads Reais do Banco de Dados
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // 2. Calcular KPIs Reais baseados nos dados capturados
  const totalLeads = leads.length;
  const confirmedLeads = leads.filter(l => l.isConfirmed).length;
  const conversionRate = totalLeads > 0 ? ((confirmedLeads / totalLeads) * 100).toFixed(1) : "0";
  
  // Buscar Assinaturas Ativas para Receita Real (Stripe Sync)
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    include: { plan: true }
  });
  
  const totalRevenue = activeSubscriptions.reduce((acc, sub) => acc + (sub.plan?.price || 0), 0);
  const averageTicket = activeSubscriptions.length > 0 ? (totalRevenue / activeSubscriptions.length).toFixed(2) : "0";

  // 3. Agrupar por Origem (Rastreamento Real)
  const sourceStats = {
    meta: leads.filter(l => l.source?.toLowerCase().includes('meta') || l.source?.toLowerCase().includes('facebook')).length,
    google: leads.filter(l => l.source?.toLowerCase().includes('google')).length,
    tiktok: leads.filter(l => l.source?.toLowerCase().includes('tiktok')).length,
    organico: leads.filter(l => !l.source || l.source.toLowerCase() === 'orgânico' || l.source.toLowerCase() === 'direto').length
  };

  // 4. Preparar dados para o gráfico de evolução dos últimos 7 dias
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = leads.filter(l => l.createdAt.toISOString().split('T')[0] === dateStr).length;
    return { 
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }), 
      leads: count 
    };
  });

  return (
    <TrafficDashboardClient 
      kpis={{
        totalLeads,
        confirmedLeads,
        conversionRate,
        totalRevenue,
        averageTicket
      }}
      chartData={last7Days}
      sourceStats={sourceStats}
      leads={leads.map(l => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        expiresAt: l.expiresAt.toISOString()
      }))}
    />
  );
}
