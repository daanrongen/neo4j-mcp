import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ManagedRuntime } from "effect";
import { Effect } from "effect";
import type { Neo4jError, QueryError } from "../../domain/errors.ts";
import { Neo4jClient } from "../../domain/Neo4jClient.ts";
import { runTool } from "../utils.ts";

export const registerSchemaTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<Neo4jClient, Neo4jError | QueryError>,
) => {
  server.tool(
    "get_schema",
    "Get the full schema of the Neo4j database: node labels with counts, relationship types with counts, and property keys.",
    {},
    {
      title: "Get Database Schema",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.getSchema();
        }),
      ),
  );

  server.tool(
    "get_labels",
    "Get all node labels in the Neo4j database, each with their node count.",
    {},
    {
      title: "Get Node Labels",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.getLabels();
        }),
      ),
  );

  server.tool(
    "get_relationship_types",
    "Get all relationship types in the Neo4j database, each with their relationship count.",
    {},
    {
      title: "Get Relationship Types",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.getRelationshipTypes();
        }),
      ),
  );

  server.tool(
    "get_indexes",
    "Get all indexes defined in the Neo4j database, including their name, type, state, labels/types, and properties.",
    {},
    {
      title: "Get Database Indexes",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.getIndexes();
        }),
      ),
  );

  server.tool(
    "get_constraints",
    "Get all constraints defined in the Neo4j database, including their name, type, entity type, labels/types, and properties.",
    {},
    {
      title: "Get Database Constraints",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.getConstraints();
        }),
      ),
  );
};
