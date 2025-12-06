import { Router } from "express";
import { AuthController } from "./AuthController";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.handle);

export { authRoutes };
