import { Router } from "express";
import { OrderController } from "./OrderController";

const orderRoutes = Router();
const controller = new OrderController();

orderRoutes.post("/", controller.create);
orderRoutes.get("/", controller.list);
orderRoutes.get("/:id", controller.show);
orderRoutes.patch("/:id/status", controller.updateStatus);
orderRoutes.post("/:id/payment", controller.addPayment);

export { orderRoutes };
