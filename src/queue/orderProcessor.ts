import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();
const prisma = new PrismaClient();

const worker = new Worker(
  "orders",
  async (job) => {
    const { orderId } = job.data;

    console.log(`🔄 Processando pedido: ${orderId}`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED" },
    });

    console.log(`✅ Pedido ${orderId} enviado!`);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }
);

console.log("🎉 Processador de pedidos iniciado!");
