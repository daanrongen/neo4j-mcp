import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ManagedRuntime } from "effect";
import type { Neo4jError, QueryError } from "../domain/errors.ts";
import type { Neo4jClient } from "../domain/Neo4jClient.ts";
import { registerInfoTools } from "./tools/info.ts";
import { registerQueryTools } from "./tools/query.ts";
import { registerSchemaTools } from "./tools/schema.ts";

export const createMcpServer = (
  runtime: ManagedRuntime.ManagedRuntime<Neo4jClient, Neo4jError | QueryError>,
): McpServer => {
  const server = new McpServer({
    name: "neo4j-mcp-server",
    version: "1.0.0",
  });

  registerQueryTools(server, runtime);
  registerSchemaTools(server, runtime);
  registerInfoTools(server, runtime);

  return server;
};
