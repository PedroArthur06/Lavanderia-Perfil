import { Router } from "express";
import { FinanceController } from "./FinanceController";

const financeRoutes = Router();
const controller = new FinanceController();

financeRoutes.get("/", controller.index);
financeRoutes.post("/expense", controller.createExpense);

export { financeRoutes };
