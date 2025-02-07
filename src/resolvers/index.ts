import { Resolvers } from "../types";

import Plant from "./Plant.resolver";
import Query from "./Query.resolver";

const resolvers: Resolvers = {
  Query,
  Plant
};

export default resolvers;
