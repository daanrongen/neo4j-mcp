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

export type Neo4jClientTestSeed = {
  labels?: Map<string, number>;
  relTypes?: Map<string, number>;
  propertyKeys?: string[];
};

const makeNeo4jClientTest = (seed: Neo4jClientTestSeed = {}) =>
  Layer.effect(
    Neo4jClient,
    Effect.gen(function* () {
      const labelsRef = yield* Ref.make<Map<string, number>>(seed.labels ?? new Map());
      const relTypesRef = yield* Ref.make<Map<string, number>>(seed.relTypes ?? new Map());
      const propertyKeysRef = yield* Ref.make<string[]>(seed.propertyKeys ?? ["id"]);
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

        getPropertyKeys: () =>
          Ref.get(propertyKeysRef).pipe(
            Effect.map((keys) => keys.map((property) => new PropertyKey({ property }))),
          ),

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
            const propertyKeys = yield* Ref.get(propertyKeysRef).pipe(
              Effect.map((keys) => keys.map((property) => new PropertyKey({ property }))),
            );
            return new SchemaInfo({ labels, relationshipTypes, propertyKeys });
          }),

        getIndexes: () => Effect.succeed([] as IndexInfo[]),

        getConstraints: () => Effect.succeed([] as ConstraintInfo[]),

        getServerInfo: () =>
          Effect.succeed(
            new ServerInfo({
              address: "bolt://localhost:7687",
              version: "Neo4j/5.0.0",
            }),
          ),
      });
    }),
  );

/**
 * Default test layer with empty labels/relTypes and a single "id" property key.
 * Use `Neo4jClientTest.make(seed)` to provide initial data.
 */
export const Neo4jClientTest = Object.assign(makeNeo4jClientTest(), {
  make: makeNeo4jClientTest,
});
