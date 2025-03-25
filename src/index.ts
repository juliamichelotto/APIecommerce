import express from "express";
import { ApolloServer } from "apollo-server-express";
import { schema } from "./graphql/schema";
import dotenv from "dotenv";


dotenv.config();


const app = express() as any;
const server = new ApolloServer({ schema });

async function startServer() {
    await server.start();
    server.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log(" http://localhost:4000/graphql");
    });
}

startServer();
