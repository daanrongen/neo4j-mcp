import { Effect, Layer, Redacted } from "effect";
import neo4j, { type Driver, type Integer, type Session } from "neo4j-driver";
import { Neo4jConfig } from "../config.ts";
import { Neo4jError, QueryError } from "../domain/errors.ts";
import {
  ConstraintInfo,
  IndexInfo,
  NodeLabel,
  PropertyKey,
  QueryResult,
  RelationshipType,
  SchemaInfo,
  ServerInfo,
} from "../domain/models.ts";
import { Neo4jClient } from "../domain/Neo4jClient.ts";

const wrapNeo4j = <A>(label: string, fn: () => Promise<A>): Effect.Effect<A, Neo4jError> =>
  Effect.tryPromise({
    try: fn,
    catch: (e) => new Neo4jError({ message: `${label} failed`, cause: e }),
  });

const runSession = <A>(
  driver: Driver,
  fn: (session: Session) => Promise<A>,
): Effect.Effect<A, Neo4jError> =>
  Effect.tryPromise({
    try: async () => {
      const session = driver.session();
      try {
        return await fn(session);
      } finally {
        await session.close();
      }
    },
    catch: (e) =>
      e instanceof Neo4jError ? e : new Neo4jError({ message: "Session error", cause: e }),
  });

// Converts neo4j Integer types to plain JS numbers
const toJs = (value: unknown): unknown => {
  if (neo4j.isInt(value as Integer)) {
    return (value as Integer).toNumber();
  }
  if (Array.isArray(value)) return value.map(toJs);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toJs(v)]),
    );
  }
  return value;
};

export const Neo4jClientLive = Layer.scoped(
  Neo4jClient,
  Effect.gen(function* () {
    const url = yield* Effect.orDie(Neo4jConfig.url);
    const password = yield* Effect.orDie(Neo4jConfig.password);

    const driver = yield* Effect.acquireRelease(
      wrapNeo4j("connect", () => {
        const d = neo4j.driver(url, neo4j.auth.basic("neo4j", Redacted.value(password)));
        return d.verifyConnectivity().then(() => d);
      }),
      (d) => Effect.promise(() => d.close()),
    );

    return {
      runQuery: (cypher, params = {}) =>
        Effect.tryPromise({
          try: async () => {
            const session = driver.session();
            try {
              const result = await session.run(cypher, params);
              return new QueryResult({
                records: result.records.map((r) =>
                  Object.fromEntries(r.keys.map((k) => [k, toJs(r.get(k))])),
                ),
                summary: {
                  queryType: result.summary.queryType,
                  counters: result.summary.counters.updates(),
                },
              });
            } finally {
              await session.close();
            }
          },
          catch: (e) => new QueryError({ query: cypher, message: "Query failed", cause: e }),
        }),

      runReadQuery: (cypher, params = {}) =>
        Effect.tryPromise({
          try: async () => {
            const session = driver.session({ defaultAccessMode: neo4j.session.READ });
            try {
              const result = await session.run(cypher, params);
              return new QueryResult({
                records: result.records.map((r) =>
                  Object.fromEntries(r.keys.map((k) => [k, toJs(r.get(k))])),
                ),
                summary: {
                  queryType: result.summary.queryType,
                  counters: result.summary.counters.updates(),
                },
              });
            } finally {
              await session.close();
            }
          },
          catch: (e) => new QueryError({ query: cypher, message: "Read query failed", cause: e }),
        }),

      getLabels: () =>
        runSession(driver, async (session) => {
          const result = await session.run("CALL db.labels() YIELD label RETURN label");
          const labels: NodeLabel[] = [];
          for (const record of result.records) {
            const label = record.get("label") as string;
            const countResult = await session.run(
              `MATCH (n:\`${label}\`) RETURN count(n) AS count`,
            );
            const count = (countResult.records[0]?.get("count") as Integer).toNumber();
            labels.push(new NodeLabel({ name: label, count }));
          }
          return labels;
        }),

      getRelationshipTypes: () =>
        runSession(driver, async (session) => {
          const result = await session.run(
            "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType",
          );
          const types: RelationshipType[] = [];
          for (const record of result.records) {
            const name = record.get("relationshipType") as string;
            const countResult = await session.run(
              `MATCH ()-[r:\`${name}\`]->() RETURN count(r) AS count`,
            );
            const count = (countResult.records[0]?.get("count") as Integer).toNumber();
            types.push(new RelationshipType({ name, count }));
          }
          return types;
        }),

      getPropertyKeys: () =>
        runSession(driver, async (session) => {
          const result = await session.run(
            "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey",
          );
          return result.records.map(
            (r: (typeof result.records)[number]) =>
              new PropertyKey({
                label: "",
                property: r.get("propertyKey") as string,
              }),
          );
        }),

      getSchema: () =>
        runSession(driver, async (session) => {
          // Labels
          const labelsResult = await session.run("CALL db.labels() YIELD label RETURN label");
          const labels: NodeLabel[] = [];
          for (const record of labelsResult.records) {
            const label = record.get("label") as string;
            const countResult = await session.run(
              `MATCH (n:\`${label}\`) RETURN count(n) AS count`,
            );
            const count = (countResult.records[0]?.get("count") as Integer).toNumber();
            labels.push(new NodeLabel({ name: label, count }));
          }

          // Relationship types
          const relResult = await session.run(
            "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType",
          );
          const relationshipTypes: RelationshipType[] = [];
          for (const record of relResult.records) {
            const name = record.get("relationshipType") as string;
            const countResult = await session.run(
              `MATCH ()-[r:\`${name}\`]->() RETURN count(r) AS count`,
            );
            const count = (countResult.records[0]?.get("count") as Integer).toNumber();
            relationshipTypes.push(new RelationshipType({ name, count }));
          }

          // Property keys
          const propsResult = await session.run(
            "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey",
          );
          const propertyKeys: PropertyKey[] = propsResult.records.map(
            (r: (typeof propsResult.records)[number]) =>
              new PropertyKey({
                label: "",
                property: r.get("propertyKey") as string,
              }),
          );

          return new SchemaInfo({ labels, relationshipTypes, propertyKeys });
        }),

      getIndexes: () =>
        runSession(driver, async (session) => {
          const result = await session.run("SHOW INDEXES");
          return result.records.map(
            (r: (typeof result.records)[number]) =>
              new IndexInfo({
                name: (r.get("name") as string) ?? "",
                type: (r.get("type") as string) ?? "",
                state: (r.get("state") as string) ?? "",
                labelsOrTypes: (r.get("labelsOrTypes") as string[]) ?? [],
                properties: (r.get("properties") as string[]) ?? [],
              }),
          );
        }),

      getConstraints: () =>
        runSession(driver, async (session) => {
          const result = await session.run("SHOW CONSTRAINTS");
          return result.records.map(
            (r: (typeof result.records)[number]) =>
              new ConstraintInfo({
                name: (r.get("name") as string) ?? "",
                type: (r.get("type") as string) ?? "",
                entityType: (r.get("entityType") as string) ?? "",
                labelsOrTypes: (r.get("labelsOrTypes") as string[]) ?? [],
                properties: (r.get("properties") as string[]) ?? [],
              }),
          );
        }),

      getServerInfo: () =>
        wrapNeo4j("getServerInfo", async () => {
          const info = await driver.getServerInfo();
          return new ServerInfo({
            address: info.address ?? "unknown",
            version: info.agent ?? "unknown",
            edition: "unknown",
          });
        }),
    };
  }),
);
