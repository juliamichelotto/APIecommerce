import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import orderQueue from "../queue/orderQueue"; 
import { autenticadorUser, autorizarAdmin } from "../authenticator/authenticator";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

const SECRET = process.env.JWT_SECRET || "supersecret";

export const resolvers = {
  Query: {
    products: async (): Promise<any> => prisma.product.findMany(),
    orders: async (_: any, __: any, context: any): Promise<any> => {
      const user = autenticadorUser(context) as { id: string };
      return prisma.order.findMany({ where: { userId: user.id } });
    },
    ecommerceStats: async (_: any, { secret }: { secret: string }): Promise<{ totalSales: number; totalOrders: number; totalUsers: number }> => {
      if (secret !== process.env.ECOMMERCE_SECRET) {
        throw new GraphQLError("Acesso negado!", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return {
        totalSales: 30000,
        totalOrders: 600,
        totalUsers: 250, 
      };
    }    
  },
  Mutation: {
    register: async (_: any, { name, email, password }: { name: string, email: string, password: string }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: { name, email, password: hashedPassword, permission: "USER" },
      });
      return "Usuário registrado com sucesso!";
    },

    login: async (_: any, { email, password }: { email: string, password: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new GraphQLError("Usuário não encontrado!", { extensions: { code: "NOT_FOUND" } });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new GraphQLError("Senha inválida!", { extensions: { code: "UNAUTHORIZED" } });

      return jwt.sign({ id: user.id, permission: user.permission }, SECRET, { expiresIn: "1h" });
    },

    addProduct: async (_: any, args: any, context: any) => {
      const user = autenticadorUser(context);
      autorizarAdmin(user);

      return prisma.product.create({ data: args });
    },

    placeOrder: async (_: any, __: any, context: any) => {
      const user = autenticadorUser(context) as { id: string };

      const order = await prisma.order.create({
        data: { userId: user.id, status: "PENDING" },
      });

      await orderQueue.add("processOrder", { orderId: order.id });

      return order;
    },

    updateOrderStatus: async (_: any, { id, status }: { id: string, status: string }, context: any) => {
      const user = autenticadorUser(context);
      autorizarAdmin(user);

      return prisma.order.update({ where: { id }, data: { status } });
    },
  },
};