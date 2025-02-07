import type { CodegenConfig } from "@graphql-codegen/cli";

const configuration: CodegenConfig = {
  schema: "./src/schemas/**/*.graphql",
  generates: {
    "./src/types.d.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./index#Context"
      }
    }
  }
};

export default configuration;
