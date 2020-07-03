import {
  Swagger,
  SwaggerReferenceProperty,
  SwaggerSchemaProperty,
} from "./types.ts";

export const getDefinitionName = ({ $ref }: SwaggerReferenceProperty): string =>
  $ref.match(/\#\/definitions\/(.+)/)![1];

export const findDefinition = (
  swagger: Swagger,
  property: SwaggerReferenceProperty,
): { property: SwaggerSchemaProperty; key: string } => {
  const definitionKey = getDefinitionName(property);
  return { key: definitionKey, property: swagger.definitions[definitionKey] };
};
