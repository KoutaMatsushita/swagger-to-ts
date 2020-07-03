export type SwaggerRequestTypes = "get" | "post" | "put" | "patch" | "delete";

export const SwaggerPrimitives = [
  "integer",
  "long",
  "float",
  "double",
  "string",
  "byte",
  "binary",
  "boolean",
  "date",
  "dateTime",
  "password",
] as const;

export type SwaggerPrimitiveTypes = typeof SwaggerPrimitives[number];

export type SwaggerReferenceProperty = {
  type: undefined;
  $ref: string;
};

export type SwaggerArrayProperty = {
  type: "array";
  items: SwaggerReferenceProperty | SwaggerPrimitiveProperty;
};

export type SwaggerObjectProperty = {
  type: "object";
  properties: {
    [P in string]: SwaggerSchemaProperty;
  };
};

export type SwaggerPrimitiveProperty = {
  type: SwaggerPrimitiveTypes;
};

export type SwaggerEnumProperty = {
  type: "string" | "integer";
  enum: string[];
};

export type SwaggerSchemaProperty =
  | SwaggerReferenceProperty
  | SwaggerArrayProperty
  | SwaggerObjectProperty
  | SwaggerPrimitiveProperty
  | SwaggerEnumProperty;

export const isSwaggerPrimitiveProperty = (
  propery: SwaggerSchemaProperty,
): propery is SwaggerPrimitiveProperty => {
  // @ts-expect-error
  return SwaggerPrimitives.includes(propery.type);
};

export const isSwaggerEnumProperty = (
  propery: SwaggerSchemaProperty,
): propery is SwaggerEnumProperty => {
  // @ts-expect-error
  return Array.isArray(propery.enum);
};

export type Swagger = {
  swagger: string;
  paths: {
    [P in string]: {
      [P in SwaggerRequestTypes]: {
        responses: {
          200?: {
            schema: SwaggerSchemaProperty;
          };
        };
      };
    };
  };
  definitions: {
    [P in string]: SwaggerSchemaProperty;
  };
};
