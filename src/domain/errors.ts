import { Data } from "effect";

export class Neo4jError extends Data.TaggedError("Neo4jError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class NodeNotFoundError extends Data.TaggedError("NodeNotFoundError")<{
  readonly id: string;
}> {}

export class QueryError extends Data.TaggedError("QueryError")<{
  readonly query: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}
