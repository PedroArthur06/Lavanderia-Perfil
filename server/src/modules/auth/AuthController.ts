import { Request, Response } from "express";
import { AuthenticateUserService } from "./AuthenticateUserService";

const authenticateUserService = new AuthenticateUserService();

export class AuthController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const result = await authenticateUserService.execute({ email, password });
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}
