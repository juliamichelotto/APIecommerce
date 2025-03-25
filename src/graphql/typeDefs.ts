import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
  }

  type Order {
    id: ID!
    status: String!
    user: User!
  }

type EcommerceStats {
  totalSales: Int!
  totalOrders: Int!
  totalUsers: Int!
}

  type Query {
    products: [Product]
    orders: [Order]
    ecommerceStats(secret: String!): EcommerceStats
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
    addProduct(name: String!, description: String!, price: Float!, stock: Int!): Product
    placeOrder: Order
    updateOrderStatus(id: ID!, status: String!): Order
  }
`;
