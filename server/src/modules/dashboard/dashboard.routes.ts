import { Router } from "express";
import { DashboardController } from "./DashboardController";

const dashboardRoutes = Router();
const controller = new DashboardController();

dashboardRoutes.get("/", controller.index);

export { dashboardRoutes };
