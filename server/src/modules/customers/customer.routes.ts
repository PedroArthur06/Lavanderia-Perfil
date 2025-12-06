import { Router } from "express";
import { CustomerController } from "./CustomerController";

const customerRoutes = Router();
const controller = new CustomerController();

customerRoutes.post("/", controller.create);
customerRoutes.get("/", controller.list);

export { customerRoutes };
