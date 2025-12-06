import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ServiceService {
  async findAll() {
    return await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }
  async create(name: string, price: number) {
    return await prisma.service.create({
      data: { name, price },
    });
  }

  async update(id: string, name: string, price: number) {
    return await prisma.service.update({
      where: { id },
      data: { name, price },
    });
  }
}
