import { Queue } from "bullmq";
import { config } from "dotenv";

config();

const orderQueue = new Queue("orders", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

export default orderQueue;
