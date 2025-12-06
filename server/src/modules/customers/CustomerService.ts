import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CustomerService {
  async create(name: string, phone: string) {
    // Verifica se já existe
    const customerExists = await prisma.customer.findUnique({
      where: { phone },
    });

    if (customerExists) {
      throw new Error("Cliente já cadastrado com este telefone.");
    }

    // Cria
    const customer = await prisma.customer.create({
      data: { name, phone },
    });

    return customer;
  }

  async findAll() {
    return await prisma.customer.findMany({
      // Ordena por nome
      orderBy: { name: "asc" },
    });
  }
}
