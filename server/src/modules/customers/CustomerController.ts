import { Request, Response } from "express";
import { CustomerService } from "./CustomerService";

const customerService = new CustomerService();

export class CustomerController {
  async create(req: Request, res: Response) {
    const { name, phone, initialDebt } = req.body; // Pegando o initialDebt

    if (!name || !phone) {
      return res
        .status(400)
        .json({ error: "Nome e telefone são obrigatórios" });
    }

    try {
      // Passando o initialDebt (se não vier, assume 0)
      const result = await customerService.create(
        name,
        phone,
        Number(initialDebt || 0)
      );
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    const result = await customerService.findAll();
    return res.json(result);
  }
}
