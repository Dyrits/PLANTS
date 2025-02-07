import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

export default await loadSchema("./**/*.graphql", {
  loaders: [new GraphQLFileLoader()]
});
