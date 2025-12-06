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

    // 2. Verificar se a senha bate
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Email ou senha incorretos");
    }

    // 3. Gerar o Token JWT
    // IMPORTANTE: Em produção, esse "segredo" DEVE vir do .env (process.env.JWT_SECRET)
    // Estou colocando hardcoded aqui APENAS para facilitar seu teste agora.
    const token = sign({}, "md5-hash-super-secreto-da-lavanderia", {
      subject: user.id, // Quem é o dono do token
      expiresIn: "1d", // Duração de 1 dia
    });

    return { token, user: { name: user.name, email: user.email } };
  }
}
