import { Router } from "express";
import { customerRoutes } from "./modules/customers/customer.routes";
import { serviceRoutes } from "./modules/services/service.routes";
import { orderRoutes } from "./modules/orders/order.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { ensureAuthenticated } from "./shared/middlewares/ensureAuthenticated";
import { financeRoutes } from "./modules/finance/finance.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/customers", ensureAuthenticated, customerRoutes);
routes.use("/services", ensureAuthenticated, serviceRoutes);
routes.use("/orders", ensureAuthenticated, orderRoutes);
routes.use("/finance", ensureAuthenticated, financeRoutes);
routes.use("/dashboard", ensureAuthenticated, dashboardRoutes);
export { routes };
