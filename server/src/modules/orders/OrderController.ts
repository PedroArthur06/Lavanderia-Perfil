import { Request, Response } from "express";
import { OrderService } from "./OrderService";

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response) {
    const { customerId, items } = req.body;

    // Validação básica
    if (!customerId || !items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Pedido precisa de Cliente e Itens." });
    }

    try {
      const order = await orderService.create({ customerId, items });
      return res.status(201).json(order);
    } catch (error: any) {
      return res
        .status(400)
        .json({ error: "Erro ao criar pedido. Verifique o ID do cliente." });
    }
  }

  async list(req: Request, res: Response) {
    const orders = await orderService.findAll();
    return res.json(orders);
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    // Validação básica
    if (!status) {
      return res.status(400).json({ error: "Status é obrigatório" });
    }

    try {
      const order = await orderService.updateStatus(Number(id), status);
      return res.json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
