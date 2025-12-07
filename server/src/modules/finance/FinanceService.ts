import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class FinanceService {
  async getSummary(startDate?: Date, endDate?: Date) {
    // Padrão: Últimos 30 dias se não vier data
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setDate(end.getDate() - 30));

    // 1. Vendas Totais (Tudo que foi pedido no período, pago ou não)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });
    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);

    // 2. Entradas Reais (O dinheiro que de fato entrou no caixa)
    const payments = await prisma.payment.findMany({
      where: {
        paidAt: { gte: start, lte: end },
      },
      include: {
        order: { include: { customer: true } }, // Pra pegar o nome do cliente
      },
    });
    const totalIncome = payments.reduce((acc, p) => acc + p.amount, 0);

    // 3. Saídas (Gastos)
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: start, lte: end },
      },
    });
    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

    // 4. Cálculos Estratégicos
    const balance = totalIncome - totalExpense; // O que sobrou no caixa
    const pendingAmount = totalSales - totalIncome; // O que ficou fiado (Vendeu mas não recebeu)

    // 5. Montar o "Caderno" (Linha do Tempo Mista)
    const ledger = [
      ...payments.map((p) => ({
        id: p.id,
        date: p.paidAt,
        description: p.order.customer.name, // Nome do Cliente
        entry: p.amount,
        exit: 0,
      })),
      ...expenses.map((e) => ({
        id: e.id,
        date: e.date,
        description: e.description, // Ex: "Combustível"
        entry: 0,
        exit: e.amount,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordenar por data

    return {
      cards: {
        totalSales, // Quanto vendeu
        totalIncome, // Quanto recebeu
        pendingAmount, // Quanto ficou devendo (Fiado)
        totalExpense, // Quanto gastou
        balance, // Lucro Real (Caixa)
      },
      ledger, // A tabela do caderno
    };
  }

  // Mantemos o método de adicionar despesa, pois ela vai precisar lançar em algum lugar,
  // mesmo que não seja o foco principal da visualização.
  async addExpense(description: string, amount: number) {
    return await prisma.expense.create({
      data: { description, amount, date: new Date() },
    });
  }
}
