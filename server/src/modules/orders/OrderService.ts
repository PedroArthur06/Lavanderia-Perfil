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
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
