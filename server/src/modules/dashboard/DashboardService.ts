import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DashboardService {
  async execute() {
    // --- PARTE 1: FINANCEIRO (Cards) ---
    
    // Vendas de Hoje 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    // Total a Receber (Total Pedidos + Dívidas Antigas) - (Total Pago)
    const allOrders = await prisma.order.aggregate({ _sum: { total: true } });
    const allPayments = await prisma.payment.aggregate({ _sum: { amount: true } });
    const customersDebt = await prisma.customer.aggregate({ _sum: { initialDebt: true } });

    const totalSales = allOrders._sum.total || 0;
    const totalPaid = allPayments._sum.amount || 0;
    const totalInitialDebt = customersDebt._sum.initialDebt || 0;
    
    // Conta de padaria: Tudo que vendi - Tudo que me pagaram = O que falta receber
    const totalReceivable = (totalSales + totalInitialDebt) - totalPaid;

    // --- PARTE 2: OPERACIONAL (Gráfico) ---

    // Agrupa pedidos por status 
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        status: { not: "DELIVERED" },
      },
    });

    const statusMap: Record<string, string> = {
      PENDING: "A Fazer",
      WASHING: "Lavando",
      READY: "Pronto",
    };

    const chartData = ordersByStatus.map((item) => ({
      name: statusMap[item.status] || item.status,
      value: item._count.id,
    }));

    // Retorna tudo organizado
    return {
      financial: {
        todaySales: todayOrders._sum.total || 0,
        totalReceivable: totalReceivable > 0 ? totalReceivable : 0, 
      },
      chart: chartData,
      totalOrders: await prisma.order.count(), 
    };
  }
}