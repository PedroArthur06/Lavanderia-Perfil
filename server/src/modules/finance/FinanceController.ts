import { Request, Response } from "express";
import { FinanceService } from "./FinanceService";

const financeService = new FinanceService();

export class FinanceController {
  async index(req: Request, res: Response) {
    const result = await financeService.getSummary();
    return res.json(result);
  }

  async createExpense(req: Request, res: Response) {
    const { description, amount } = req.body;

    if (!description || !amount) {
      return res
        .status(400)
        .json({ error: "Descrição e valor são obrigatórios" });
    }

    const expense = await financeService.addExpense(
      description,
      Number(amount)
    );
    return res.status(201).json(expense);
  }
}
