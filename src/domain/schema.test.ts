import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { Neo4jClientTest } from "../infra/Neo4jClientTest.ts";
import { Neo4jClient } from "./Neo4jClient.ts";

describe("schema", () => {
  it("getLabels returns an empty array when no labels are set", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getLabels();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result).toEqual([]);
  });

  it("getRelationshipTypes returns an empty array when no types are set", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getRelationshipTypes();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result).toEqual([]);
  });

  it("getPropertyKeys returns the default test property key", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getPropertyKeys();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.property).toBe("id");
  });

  it("getSchema returns a SchemaInfo with empty labels and relationship types", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getSchema();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.labels).toEqual([]);
    expect(result.relationshipTypes).toEqual([]);
    expect(result.propertyKeys).toHaveLength(1);
  });

  it("getIndexes returns an empty array", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getIndexes();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result).toEqual([]);
  });

  it("getConstraints returns an empty array", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getConstraints();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result).toEqual([]);
  });

  it("getServerInfo returns the test server address", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getServerInfo();
      }).pipe(Effect.provide(Neo4jClientTest)),
    );
    expect(result.address).toBe("bolt://localhost:7687");
    expect(result.version).toBe("Neo4j/5.0.0");
  });

  it("getLabels returns seeded labels", async () => {
    const seed = {
      labels: new Map([
        ["Person", 10],
        ["Movie", 5],
      ]),
    };
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getLabels();
      }).pipe(Effect.provide(Neo4jClientTest.make(seed))),
    );
    expect(result).toHaveLength(2);
    expect(result.find((l) => l.name === "Person")?.count).toBe(10);
    expect(result.find((l) => l.name === "Movie")?.count).toBe(5);
  });

  it("getRelationshipTypes returns seeded relationship types", async () => {
    const seed = {
      relTypes: new Map([
        ["ACTED_IN", 20],
        ["DIRECTED", 8],
      ]),
    };
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getRelationshipTypes();
      }).pipe(Effect.provide(Neo4jClientTest.make(seed))),
    );
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.name === "ACTED_IN")?.count).toBe(20);
  });

  it("getPropertyKeys returns seeded property keys", async () => {
    const seed = { propertyKeys: ["id", "name", "title"] };
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getPropertyKeys();
      }).pipe(Effect.provide(Neo4jClientTest.make(seed))),
    );
    expect(result).toHaveLength(3);
    expect(result.map((k) => k.property)).toEqual(["id", "name", "title"]);
  });

  it("getSchema returns seeded labels and relationship types", async () => {
    const seed = {
      labels: new Map([["Person", 3]]),
      relTypes: new Map([["KNOWS", 7]]),
      propertyKeys: ["id", "name"],
    };
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* Neo4jClient;
        return yield* client.getSchema();
      }).pipe(Effect.provide(Neo4jClientTest.make(seed))),
    );
    expect(result.labels).toHaveLength(1);
    expect(result.labels[0]?.name).toBe("Person");
    expect(result.relationshipTypes).toHaveLength(1);
    expect(result.relationshipTypes[0]?.name).toBe("KNOWS");
    expect(result.propertyKeys).toHaveLength(2);
  });
});
