import { Request, Response } from "express";
import { ServiceService } from "./ServiceService";

const serviceService = new ServiceService();

export class ServiceController {
  async list(req: Request, res: Response) {
    const result = await serviceService.findAll();
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "Nome e Preço são obrigatórios" });
    }

    const result = await serviceService.create(name, Number(price));
    return res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, price } = req.body;

    try {
      const result = await serviceService.update(id, name, Number(price));
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar serviço" });
    }
  }
}
