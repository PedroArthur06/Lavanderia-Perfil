import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CustomerService {
  // Atualize o create para aceitar initialDebt
  async create(name: string, phone: string, initialDebt: number = 0) {
    const customerExists = await prisma.customer.findUnique({
      where: { phone },
    });

    if (customerExists) {
      throw new Error("Cliente já cadastrado com este telefone.");
    }

    const customer = await prisma.customer.create({
      data: { name, phone, initialDebt },
    });

    return customer;
  }

  async findAll() {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          include: {
            payments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const customersWithBalance = customers.map((customer) => {
      const totalOrders = customer.orders.reduce(
        (acc, order) => acc + order.total,
        0
      );

      const totalPaid = customer.orders.reduce((acc, order) => {
        const paymentsForOrder = order.payments.reduce(
          (sum, pay) => sum + pay.amount,
          0
        );
        return acc + paymentsForOrder;
      }, 0);

      // LÓGICA NOVA: (Dívida do Caderno) + (Consumo no Sistema) - (O que pagou no sistema)
      const debt = customer.initialDebt + totalOrders - totalPaid;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalOrders,
        totalPaid,
        initialDebt: customer.initialDebt,
        debt,
        hasDebt: debt > 0.5,
      };
    });

    return customersWithBalance.sort((a, b) => b.debt - a.debt);
  }
}
