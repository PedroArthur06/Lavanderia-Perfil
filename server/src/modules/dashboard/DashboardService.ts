import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DashboardService {
  async getMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Vendas de Hoje (Soma total dos pedidos criados hoje)
    const todayOrders = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 2. Pedidos Ativos (Tudo que não foi Entregue ainda)
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: { not: "DELIVERED" },
      },
    });

    // 3. Total a Receber (Fiado Geral) - Lógica simplificada
    // Pegamos todos os pedidos e subtraímos os pagamentos
    const allOrders = await prisma.order.aggregate({ _sum: { total: true } });
    const allPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    // Precisamos somar também as dívidas iniciais dos clientes (importante!)
    const customersInitialDebt = await prisma.customer.aggregate({
      _sum: { initialDebt: true },
    });

    const totalSales = allOrders._sum.total || 0;
    const totalPaid = allPayments._sum.amount || 0;
    const totalInitialDebt = customersInitialDebt._sum.initialDebt || 0;

    const totalReceivable = totalSales + totalInitialDebt - totalPaid;

    // 4. Dados para o Gráfico de Pizza (Pedidos por Status)
    // Agrupa por status e conta quantos tem em cada
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        status: { not: "DELIVERED" }, // Não queremos ver os entregues no gráfico de operação
      },
    });

    // Formata para o Frontend
    const chartData = ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    return {
      todaySales: todayOrders._sum.total || 0,
      activeOrders: activeOrdersCount,
      totalReceivable,
      chartData,
    };
  }
}
