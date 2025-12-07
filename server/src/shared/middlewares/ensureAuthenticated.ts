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

  // 1. Validar se o token veio
  if (!authToken) {
    return res.status(401).json({ error: "Token não informado" });
  }

  // O token vem assim: "Bearer dwdwdwdwdwdwd"
  // Precisamos tirar o "Bearer" e pegar só o hash
  const [, token] = authToken.split(" ");

  try {
    // 2. Validar se o token é válido
    const { sub } = verify(
      token,
      "md5-hash-super-secreto-da-lavanderia"
    ) as IPayload;

    // 3. Injetar o ID do usuário na requisição (para usar depois se precisar)
    // @ts-ignore -> Hack rápido para não precisar reescrever tipagem do Express agora
    req.user_id = sub;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
