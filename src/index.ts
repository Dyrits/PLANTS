import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { configDotenv } from "dotenv";

import TrefleAPI from "./datasources/TrefleAPI";

import typeDefs from "./schemas";
import resolvers from "./resolvers";

configDotenv();

export interface Context {
  sources: {
    rest: {
      trefle: TrefleAPI;
    };
  };
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) },
  context: async () => {
    const { cache } = server;
    return {
      sources: {
        rest: {
          trefle: new TrefleAPI({ cache })
        }
      }
    };
  }
});

console.log(`🚀  Server ready at: ${url}`);
