import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateOrderDTO {
  customerId: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export class OrderService {
  async create({ customerId, items }: CreateOrderDTO) {
    // 1. Calcular o total no Backend
    const total = items.reduce((acc, item) => {
      return acc + item.quantity * item.unitPrice;
    }, 0);

    // 2. Criar Pedido + Itens numa tacada só
    const order = await prisma.order.create({
      data: {
        customerId,
        total,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return order;
  }

  async findAll() {
    return await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(orderId: number, newStatus: string) {
    // Validar status permitidos
    const allowedStatuses = [
      "PENDING",
      "WASHING",
      "DRYING",
      "IRONING",
      "READY",
      "DELIVERED",
    ];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Status inválido. Use: ${allowedStatuses.join(", ")}`);
    }

    // Atualizar pedido
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        customer: true,
        items: true,
      },
    });

    return order;
  }

  async addPayment(orderId: number, amount: number, method: string) {
    // 1. Verifica se o pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw new Error("Pedido não encontrado");

    // 2. Verifica se não está pagando a mais do que deve
    const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = order.total - totalPaid;

    if (amount > remaining + 0.1) {
      // Margem de erro de float
      throw new Error("Valor do pagamento excede o restante do pedido.");
    }

    // 3. Cria o pagamento
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method, // "PIX", "DINHEIRO", "CARTAO"
      },
    });

    // Se quitou tudo, podemos atualizar o status para READY ou DELIVERED se quiser
    // Mas vamos deixar manual por enquanto.

    return payment;
  }
}
