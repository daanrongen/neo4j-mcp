import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ManagedRuntime } from "effect";
import { Effect } from "effect";
import type { Neo4jError, QueryError } from "../../domain/errors.ts";
import { Neo4jClient } from "../../domain/Neo4jClient.ts";
import { formatError, formatSuccess } from "../utils.ts";

export const registerInfoTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<Neo4jClient, Neo4jError | QueryError>,
) => {
  server.tool(
    "get_server_info",
    "Get information about the connected Neo4j server: address, version, and edition.",
    {},
    {
      title: "Get Server Info",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async () => {
      const result = await runtime.runPromiseExit(
        Effect.gen(function* () {
          const client = yield* Neo4jClient;
          return yield* client.getServerInfo();
        }),
      );
      if (result._tag === "Failure") return formatError(result.cause);
      return formatSuccess(result.value);
    },
  );
};
