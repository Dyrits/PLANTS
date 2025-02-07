import { PlantResolvers } from "../types";

const resolvers: PlantResolvers = {
  genus_family_common_name: async ({ genus_id }, _, { sources }) => {
    return sources.rest.trefle.getGenusName(genus_id);
  },
  species_observation: async ({ id }, _, { sources }) => {
    return sources.rest.trefle.getSpeciesObservation(id);
  }
};

export default resolvers;
