import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ManagedRuntime } from "effect";
import { Effect } from "effect";
import { z } from "zod";
import type { Neo4jError, QueryError } from "../../domain/errors.ts";
import { Neo4jClient } from "../../domain/Neo4jClient.ts";
import { runTool } from "../utils.ts";

export const registerQueryTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<Neo4jClient, Neo4jError | QueryError>,
) => {
  server.tool(
    "run_query",
    "Run a Cypher query against the Neo4j database. Returns records and summary counters.",
    {
      cypher: z.string().describe("The Cypher query to execute"),
      params: z
        .record(z.unknown())
        .optional()
        .describe("Optional query parameters as a key-value object"),
    },
    {
      title: "Run Cypher Query",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async ({ cypher, params }) =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.runQuery(cypher, params);
        }),
      ),
  );

  server.tool(
    "run_read_query",
    "Run a read-only Cypher query against the Neo4j database. Safer for queries that do not modify data.",
    {
      cypher: z.string().describe("The read-only Cypher query to execute"),
      params: z
        .record(z.unknown())
        .optional()
        .describe("Optional query parameters as a key-value object"),
    },
    {
      title: "Run Read-Only Cypher Query",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async ({ cypher, params }) =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.runReadQuery(cypher, params);
        }),
      ),
  );
};
