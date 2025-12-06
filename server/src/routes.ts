import { Router } from "express";
import { customerRoutes } from "./modules/customers/customer.routes";
import { serviceRoutes } from "./modules/services/service.routes";
import { orderRoutes } from "./modules/orders/order.routes";
const routes = Router();

routes.use("/customers", customerRoutes);
routes.use("/services", serviceRoutes);
routes.use("/orders", orderRoutes);

export { routes };
