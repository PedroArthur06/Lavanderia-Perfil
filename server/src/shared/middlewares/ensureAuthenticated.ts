import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
  sub: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Token não informado" });
  }

  const [, token] = authToken.split(" ");

  try {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET missing");
    }

    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
