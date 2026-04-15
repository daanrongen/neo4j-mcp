# neo4j-mcp

MCP server for [Neo4j](https://neo4j.com/) — run Cypher queries, explore graph schema, and inspect database info over stdio.

## Installation

```bash
bunx @daanrongen/neo4j-mcp
```

## Tools (8 total)

| Domain     | Tools                                                                          | Coverage                                        |
| ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| **Query**  | `run_query`, `run_read_query`                                                  | Execute Cypher queries (write and read-only)    |
| **Schema** | `get_schema`, `get_labels`, `get_relationship_types`, `get_indexes`, `get_constraints` | Inspect graph schema and metadata       |
| **Info**   | `get_server_info`                                                              | Neo4j server address and version                |

## Configuration

| Variable         | Required | Description                                                              |
| ---------------- | -------- | ------------------------------------------------------------------------ |
| `NEO4J_URL`      | Yes      | Bolt URL (e.g. `bolt://localhost:7687` or `neo4j://localhost:7687`)      |
| `NEO4J_PASSWORD` | Yes      | Neo4j password (username defaults to `neo4j`)                            |

## Setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "neo4j": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@daanrongen/neo4j-mcp"],
      "env": {
        "NEO4J_URL": "bolt://localhost:7687",
        "NEO4J_PASSWORD": "your-password"
      }
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add neo4j \
  -e NEO4J_URL=bolt://localhost:7687 \
  -e NEO4J_PASSWORD=your-password \
  -- bunx @daanrongen/neo4j-mcp
```

## Development

```bash
bun install
bun run dev        # run with --watch
bun test           # run test suite
bun run typecheck  # tsc type check
bun run lint       # biome lint
bun run build      # bundle to dist/main.js
```

## Inspecting locally

`bun run inspect` launches the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) against the local build:

```bash
bun run build && bun run inspect
```

This opens the Inspector UI in your browser where you can call any tool interactively and inspect request/response shapes.

## Architecture

```
src/
├── config.ts                # Effect Config — NEO4J_URL, NEO4J_PASSWORD
├── main.ts                  # Entry point — ManagedRuntime + StdioServerTransport
├── domain/
│   ├── Neo4jClient.ts       # Context.Tag service interface
│   ├── errors.ts            # Neo4jError, QueryError, NodeNotFoundError
│   ├── models.ts            # Schema.Class models (QueryResult, SchemaInfo, IndexInfo, …)
│   ├── query.test.ts        # Domain query tests (uses Neo4jClientTest)
│   └── schema.test.ts       # Domain schema tests (uses Neo4jClientTest)
├── infra/
│   ├── Neo4jClientLive.ts   # Layer.scoped — neo4j-driver connection with acquireRelease
│   └── Neo4jClientTest.ts   # In-memory Ref-based test adapter
└── mcp/
    ├── server.ts            # McpServer wired to ManagedRuntime
    ├── utils.ts             # formatSuccess, formatError
    └── tools/               # query.ts, schema.ts, info.ts
```

## License

MIT
