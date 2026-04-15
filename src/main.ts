#!/usr/bin/env bun
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ManagedRuntime } from "effect";
import { Neo4jClientLive } from "./infra/Neo4jClientLive.ts";
import { createMcpServer } from "./mcp/server.ts";

const runtime = ManagedRuntime.make(Neo4jClientLive);

const server = createMcpServer(runtime);

const transport = new StdioServerTransport();

await server.connect(transport);

const shutdown = async () => {
  await runtime.runPromise(runtime.disposeEffect);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
