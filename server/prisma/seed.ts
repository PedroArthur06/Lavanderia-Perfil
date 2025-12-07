import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Criar Serviços (Mantendo o que já existia)
  const services = [
    { name: "Camisa Social", price: 7.0 },
    { name: "Camiseta Simples", price: 5.0 },
    { name: "Calça Jeans", price: 12.0 },
    { name: "Calça Social", price: 15.0 },
    { name: "Terno (Paletó + Calça)", price: 35.0 },
    { name: "Vestido Simples", price: 20.0 },
    { name: "Vestido de Festa", price: 50.0 },
    { name: "Jaqueta / Casaco", price: 25.0 },
    { name: "Edredom Solteiro", price: 30.0 },
    { name: "Edredom Casal", price: 40.0 },
    { name: "Edredom King/Queen", price: 50.0 },
    { name: "Cobertor", price: 35.0 },
    { name: "Toalha de Banho", price: 8.0 },
    { name: "Cesto P (até 5kg - Só Lavar)", price: 35.0 },
    { name: "Cesto M (até 10kg - Só Lavar)", price: 60.0 },
    { name: "Lavagem por Kg (Avulso)", price: 12.0 },
  ];

  for (const service of services) {
    // Usamos upsert para não dar erro se já existir
    await prisma.service
      .upsert({
        where: { id: service.name }, // Hack rápido: assumindo que não repetimos nomes no seed
        update: {},
        create: service,
      })
      .catch(() => {}); // Ignora erros de duplicidade no seed simples
  }

  // 2. CRIAR O ADMIN (Essa é a parte que faltava!)
  const passwordHash = await hash("123456", 8);

  await prisma.user.upsert({
    where: { email: "admin@perfil.com" }, // <--- O EMAIL CORRETO É ESSE
    update: {},
    create: {
      name: "Dona da Lavanderia",
      email: "admin@perfil.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log("🌱 Banco populado: Serviços + Admin criado!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
