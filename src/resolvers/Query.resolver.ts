import { cacheControlFromInfo } from "@apollo/cache-control-types";

import { QueryResolvers } from "../types";

const resolvers: QueryResolvers = {
  plants: async (_, { family_common_name }, { sources }, info) => {
    const cacheControl = cacheControlFromInfo(info);
    cacheControl.setCacheHint({ maxAge: 900 });
    return sources.rest.trefle.getPlants(family_common_name);
  }
};

export default resolvers;
