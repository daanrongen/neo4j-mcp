import { Effect, Layer, Ref } from "effect";
import {
  type ConstraintInfo,
  type IndexInfo,
  NodeLabel,
  PropertyKey,
  QueryResult,
  RelationshipType,
  SchemaInfo,
  ServerInfo,
} from "../domain/models.ts";
import { Neo4jClient } from "../domain/Neo4jClient.ts";

export const Neo4jClientTest = Layer.effect(
  Neo4jClient,
  Effect.gen(function* () {
    const labelsRef = yield* Ref.make<Map<string, number>>(new Map());
    const relTypesRef = yield* Ref.make<Map<string, number>>(new Map());
    const queryLogRef = yield* Ref.make<string[]>([]);

    return Neo4jClient.of({
      runQuery: (cypher, _params = {}) =>
        Effect.gen(function* () {
          yield* Ref.update(queryLogRef, (log) => [...log, cypher]);
          return new QueryResult({
            records: [],
            summary: { queryType: "w", counters: {} },
          });
        }),

      runReadQuery: (cypher, _params = {}) =>
        Effect.gen(function* () {
          yield* Ref.update(queryLogRef, (log) => [...log, cypher]);
          return new QueryResult({
            records: [],
            summary: { queryType: "r", counters: {} },
          });
        }),

      getLabels: () =>
        Ref.get(labelsRef).pipe(
          Effect.map((m) =>
            [...m.entries()].map(([name, count]) => new NodeLabel({ name, count })),
          ),
        ),

      getRelationshipTypes: () =>
        Ref.get(relTypesRef).pipe(
          Effect.map((m) =>
            [...m.entries()].map(([name, count]) => new RelationshipType({ name, count })),
          ),
        ),

      getPropertyKeys: () => Effect.succeed([new PropertyKey({ label: "", property: "id" })]),

      getSchema: () =>
        Effect.gen(function* () {
          const labels = yield* Ref.get(labelsRef).pipe(
            Effect.map((m) =>
              [...m.entries()].map(([name, count]) => new NodeLabel({ name, count })),
            ),
          );
          const relationshipTypes = yield* Ref.get(relTypesRef).pipe(
            Effect.map((m) =>
              [...m.entries()].map(([name, count]) => new RelationshipType({ name, count })),
            ),
          );
          return new SchemaInfo({
            labels,
            relationshipTypes,
            propertyKeys: [new PropertyKey({ label: "", property: "id" })],
          });
        }),

      getIndexes: () => Effect.succeed([] as IndexInfo[]),

      getConstraints: () => Effect.succeed([] as ConstraintInfo[]),

      getServerInfo: () =>
        Effect.succeed(
          new ServerInfo({
            address: "bolt://localhost:7687",
            version: "Neo4j/5.0.0",
            edition: "community",
          }),
        ),
    });
  }),
);
