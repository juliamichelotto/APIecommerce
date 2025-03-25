import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";


export const autenticadorUser = (context: any) => {
  const authHeader = context.req.headers.authorization;
  if (!authHeader) {
    throw new GraphQLError("Não autenticado!", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
  } catch (error) {
    throw new GraphQLError("Senha inválida ou expirada!", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};


export const autorizarAdmin = (user: any) => {
  if (user.permission !== "ADMIN") {
    throw new GraphQLError("Acesso negado!", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};
