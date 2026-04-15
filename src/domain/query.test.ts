import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { Neo4jClientTest } from "../infra/Neo4jClientTest.ts";
import { Neo4jClient } from "./Neo4jClient.ts";

describe("query", () => {
  it("runQuery returns an empty QueryResult", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.runQuery("MATCH (n) RETURN n LIMIT 10");
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.records).toEqual([]);
    expect(result.summary.queryType).toBe("w");
  });

  it("runReadQuery returns an empty QueryResult with read query type", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.runReadQuery("MATCH (n) RETURN n LIMIT 10");
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.records).toEqual([]);
    expect(result.summary.queryType).toBe("r");
  });

  it("runQuery with params completes without error", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.runQuery("MATCH (n {id: $id}) RETURN n", { id: "abc" });
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.records).toEqual([]);
  });

  it("runReadQuery with params completes without error", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.runReadQuery("MATCH (n {name: $name}) RETURN n", {
          name: "Alice",
        });
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.records).toEqual([]);
  });

  it("runQuery multiple times does not error", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        yield* client.runQuery("CREATE (n:Test {id: '1'})");
        yield* client.runQuery("CREATE (n:Test {id: '2'})");
        return yield* client.runReadQuery("MATCH (n:Test) RETURN n");
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.records).toEqual([]);
  });
});
