import { Request, Response } from "express";
import { DashboardService } from "./DashboardService";

const dashboardService = new DashboardService();

export class DashboardController {
  async index(req: Request, res: Response) {
    const result = await dashboardService.execute();
    return res.json(result);
  }
}
