import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IOrderRequest {
  customerId: string;
  items: {
    serviceId: string;
    quantity: number;
  }[];
  discount?: number;
}

export class OrderService {
  async create({ customerId, items, discount = 0 }: IOrderRequest) {
    // 1. Calcular o preço total dos itens (Subtotal)
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const service = await prisma.service.findUnique({
        where: { id: item.serviceId },
      });

      if (!service) {
        throw new Error(`Serviço com ID ${item.serviceId} não encontrado.`);
      }

      const itemTotal = service.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        name: service.name,
        quantity: item.quantity,
        unitPrice: service.price,
      });
    }

    // 2. Validação de Segurança
    if (discount < 0) {
       throw new Error("O desconto não pode ser negativo.");
    }
    if (discount > subtotal) {
       throw new Error("O desconto não pode ser maior que o valor do pedido.");
    }

    // 3. Cálculo Final
    const total = subtotal - discount;

    // 4. Salvar no Banco
    const order = await prisma.order.create({
      data: {
        customerId,
        discount, // Salva quanto foi dado de desconto
        total,    // Salva o valor final a pagar
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        customer: true,
        payments: true,
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
