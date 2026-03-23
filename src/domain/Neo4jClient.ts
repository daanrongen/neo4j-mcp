import { Context, type Effect } from "effect";
import type { Neo4jError, QueryError } from "./errors.ts";
import type {
  ConstraintInfo,
  IndexInfo,
  NodeLabel,
  PropertyKey,
  QueryResult,
  RelationshipType,
  SchemaInfo,
  ServerInfo,
} from "./models.ts";

export interface Neo4jClientService {
  // Query
  readonly runQuery: (
    cypher: string,
    params?: Record<string, unknown>,
  ) => Effect.Effect<QueryResult, QueryError | Neo4jError>;
  readonly runReadQuery: (
    cypher: string,
    params?: Record<string, unknown>,
  ) => Effect.Effect<QueryResult, QueryError | Neo4jError>;

  // Schema
  readonly getLabels: () => Effect.Effect<NodeLabel[], Neo4jError>;
  readonly getRelationshipTypes: () => Effect.Effect<RelationshipType[], Neo4jError>;
  readonly getPropertyKeys: () => Effect.Effect<PropertyKey[], Neo4jError>;
  readonly getSchema: () => Effect.Effect<SchemaInfo, Neo4jError>;
  readonly getIndexes: () => Effect.Effect<IndexInfo[], Neo4jError>;
  readonly getConstraints: () => Effect.Effect<ConstraintInfo[], Neo4jError>;

  // Info
  readonly getServerInfo: () => Effect.Effect<ServerInfo, Neo4jError>;
}

export class Neo4jClient extends Context.Tag("Neo4jClient")<Neo4jClient, Neo4jClientService>() {}
