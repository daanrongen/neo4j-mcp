import { Schema } from "effect";

export class QueryResult extends Schema.Class<QueryResult>("QueryResult")({
  records: Schema.Array(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  summary: Schema.Struct({
    queryType: Schema.String,
    counters: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  }),
}) {}

export class NodeLabel extends Schema.Class<NodeLabel>("NodeLabel")({
  name: Schema.String,
  count: Schema.Number,
}) {}

export class RelationshipType extends Schema.Class<RelationshipType>("RelationshipType")({
  name: Schema.String,
  count: Schema.Number,
}) {}

export class PropertyKey extends Schema.Class<PropertyKey>("PropertyKey")({
  property: Schema.String,
}) {}

export class SchemaInfo extends Schema.Class<SchemaInfo>("SchemaInfo")({
  labels: Schema.Array(NodeLabel),
  relationshipTypes: Schema.Array(RelationshipType),
  propertyKeys: Schema.Array(PropertyKey),
}) {}

export class ServerInfo extends Schema.Class<ServerInfo>("ServerInfo")({
  address: Schema.String,
  version: Schema.String,
}) {}

export class IndexInfo extends Schema.Class<IndexInfo>("IndexInfo")({
  name: Schema.String,
  type: Schema.String,
  state: Schema.String,
  labelsOrTypes: Schema.Array(Schema.String),
  properties: Schema.Array(Schema.String),
}) {}

export class ConstraintInfo extends Schema.Class<ConstraintInfo>("ConstraintInfo")({
  name: Schema.String,
  type: Schema.String,
  entityType: Schema.String,
  labelsOrTypes: Schema.Array(Schema.String),
  properties: Schema.Array(Schema.String),
}) {}
