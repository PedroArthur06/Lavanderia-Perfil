import { Router } from "express";
import { ServiceController } from "./ServiceController";

const serviceRoutes = Router();
const controller = new ServiceController();

serviceRoutes.get("/", controller.list);
serviceRoutes.post("/", controller.create);
serviceRoutes.put("/:id", controller.update);

export { serviceRoutes };
