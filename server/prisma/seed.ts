import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const services = [
    // --- PEÇAS AVULSAS (PREÇO EXEMPLO) ---
    { name: "Camisa Social", price: 7.0 },
    { name: "Camiseta Simples", price: 5.0 },
    { name: "Calça Jeans", price: 12.0 },
    { name: "Calça Social", price: 15.0 },
    { name: "Terno (Paletó + Calça)", price: 35.0 },
    { name: "Vestido Simples", price: 20.0 },
    { name: "Vestido de Festa", price: 50.0 },
    { name: "Jaqueta / Casaco", price: 25.0 },

    // --- CAMA E BANHO ---
    { name: "Edredom Solteiro", price: 30.0 },
    { name: "Edredom Casal", price: 40.0 },
    { name: "Edredom King/Queen", price: 50.0 },
    { name: "Cobertor", price: 35.0 },
    { name: "Toalha de Banho", price: 8.0 },

    // --- COMBOS / CESTOS ---
    { name: "Cesto P (até 5kg - Só Lavar)", price: 35.0 },
    { name: "Cesto M (até 10kg - Só Lavar)", price: 60.0 },
    { name: "Lavagem por Kg (Avulso)", price: 12.0 },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  console.log(" Banco de dados populado com serviços padrão!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
