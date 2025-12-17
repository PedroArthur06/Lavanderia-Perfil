import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

interface IAuthRequest {
  email: string;
  password: string;
}

export class AuthenticateUserService {
  async execute({ email, password }: IAuthRequest) {
    // 1. Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Email ou senha incorretos");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Erro crítico: JWT_SECRET não definido no ambiente.");
    }

    const token = sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "1d",
    });

    return { token, user: { name: user.name, email: user.email } };
  }
}
