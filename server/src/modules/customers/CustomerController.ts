import { Request, Response } from "express";
import { CustomerService } from "./CustomerService";

const customerService = new CustomerService();

export class CustomerController {
  async create(req: Request, res: Response) {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res
        .status(400)
        .json({ error: "Nome e telefone são obrigatórios" });
    }

    try {
      const result = await customerService.create(name, phone);
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
