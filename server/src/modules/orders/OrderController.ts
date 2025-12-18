import { Request, Response } from "express";
import { z } from "zod";
import { OrderService } from "./OrderService";
import { OrderStatus } from "@prisma/client";

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response) {
    const createOrderSchema = z.object({
      customerId: z.string().min(1, "Customer ID is required"),
      items: z.array(
        z.object({
          serviceId: z.string().min(1, "Service ID is required"),
          quantity: z.number().int().positive("Quantity must be positive"),
        })
      ).min(1, "At least one item is required"),
      discount: z.coerce.number().min(0).optional().default(0),
    });

    const { customerId, items, discount } = createOrderSchema.parse(req.body);

    const order = await orderService.create({
      customerId,
      items,
      discount,
    });
    return res.status(201).json(order);
  }

  async list(req: Request, res: Response) {
    const orders = await orderService.findAll();
    return res.json(orders);
  }

  async updateStatus(req: Request, res: Response) {
    const updateStatusSchema = z.object({
      status: z.nativeEnum(OrderStatus, {
        message: "Status inválido. Use: " + Object.values(OrderStatus).join(", "),
      }),
    });

    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const order = await orderService.updateStatus(Number(id), status);
    return res.json(order);
  }

  async addPayment(req: Request, res: Response) {
    const addPaymentSchema = z.object({
      amount: z.coerce.number().positive("Amount must be positive"),
      method: z.string().min(1, "Payment method is required"),
    });

    const { id } = req.params;
    const { amount, method } = addPaymentSchema.parse(req.body);

    const payment = await orderService.addPayment(
      Number(id),
      amount,
      method
    );
    return res.status(201).json(payment);
  }
}

