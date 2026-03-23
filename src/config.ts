import { Config } from "effect";

export const Neo4jConfig = {
  url: Config.string("NEO4J_URL"),
  password: Config.redacted("NEO4J_PASSWORD"),
};
