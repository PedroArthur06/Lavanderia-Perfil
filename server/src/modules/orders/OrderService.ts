import { PrismaClient, OrderStatus } from "@prisma/client"; 
import { AppError } from "../../shared/errors/AppError";

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

  async findById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    return order;
  }

  async create({ customerId, items, discount = 0 }: IOrderRequest) {
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const service = await prisma.service.findUnique({
        where: { id: item.serviceId },
      });

      if (!service) {
        throw new AppError(`Serviço com ID ${item.serviceId} não encontrado.`, 404);
      }

      const itemTotal = service.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        name: service.name,
        quantity: item.quantity,
        unitPrice: service.price,
      });
    }

    if (discount < 0) {
       throw new AppError("O desconto não pode ser negativo.");
    }
    if (discount > subtotal) {
       throw new AppError("O desconto não pode ser maior que o valor do pedido.");
    }

    const total = subtotal - discount;

    const order = await prisma.order.create({
      data: {
        customerId,
        discount,
        total,
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

  async updateStatus(orderId: number, newStatus: OrderStatus) {

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
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw new AppError("Pedido não encontrado", 404);

    const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = order.total - totalPaid;

    if (amount > remaining + 0.1) {
      throw new AppError("Valor do pagamento excede o restante do pedido.");
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
      },
    });

    return payment;
  }
}