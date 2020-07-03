import {
  SwaggerPrimitiveProperty,
  SwaggerObjectProperty,
  isSwaggerPrimitiveProperty,
  Swagger,
  SwaggerSchemaProperty,
  SwaggerRequestTypes,
  SwaggerReferenceProperty,
} from "./types.ts";
import { getDefinitionName, findDefinition } from "./findDefinition.ts";

const queue: SwaggerReferenceProperty[] = [];
const convertedKeys: string[] = [];
const tsTypes: string[] = [];

/**
 * convert swagger primitive type to typescript primitive type
 * 
 * @param property target property
 */
export const primitiveToTs = (property: SwaggerPrimitiveProperty): string => {
  switch (property.type) {
    case "integer":
    case "long":
    case "float":
    case "double":
      return "number";
    case "string":
    case "byte":
    case "binary":
    case "date":
    case "dateTime":
    case "password":
      return "string";
    case "boolean":
      return "boolean";
    default:
      const _exhaustiveCheck: never = property.type;
      return _exhaustiveCheck;
  }
};

/**
 * convert swagger object type to typescript object type
 * 
 * @param swagger original schema
 * @param properties target object property
 */
export const objectToTsParams = (
  swagger: Swagger,
  { properties }: SwaggerObjectProperty,
): string => {
  let ts = "";
  Object.keys(properties).forEach((key) => {
    const property = properties[key];
    if (isSwaggerPrimitiveProperty(property)) {
      ts += `  ${key}: ${primitiveToTs(property)};\n`;
    } else {
      switch (property.type) {
        case "array":
          if (isSwaggerPrimitiveProperty(property.items)) {
            ts += `  ${key}: ${primitiveToTs(property.items)}[];\n`;
          } else {
            queue.push(property.items);
            ts += `  ${key}: ${getDefinitionName(property.items)}[];\n`;
          }
          break;
        case "object":
          ts += `  ${key}: {\n  ${objectToTsParams(swagger, property)}  };\n`;
          break;
        case undefined:
          createTs(
            swagger,
            findDefinition(swagger, property),
          );
          break;
        default:
          console.warn(properties[key]);
          throw Error(`unknown type: ${properties[key].type}`);
      }
    }
  });
  return ts;
};

/**
 * create typescript type
 * 
 * @param swagger original schema
 * @param param0 
 */
const createTs = (
  swagger: Swagger,
  { key, property }: { key: string; property: SwaggerSchemaProperty },
) => {
  if (convertedKeys.includes(key)) {
    return "";
  }
  convertedKeys.push(key);
  let ts = `type ${key} = `;

  switch (property.type) {
    case "object":
      ts += "{\n";
      ts += objectToTsParams(swagger, property);
      ts += "};";
      break;
    case "array":
      if (property.items.type == undefined) {
        const definition = findDefinition(swagger, property.items);
        createTs(swagger, definition);
        ts += `${definition.key}[]\n`;
      } else if (isSwaggerPrimitiveProperty(property.items)) {
        const name = primitiveToTs(property.items);
        ts += `${name}[]\n`;
      } else {
        const definition = findDefinition(swagger, property.items);
        createTs(swagger, definition);
        ts += `${definition.key}[]\n`;
      }
      break;
    default:
      console.warn(property);
      throw Error(`unknown type: ${property.type}`);
  }

  while (queue.length > 0) {
    const item = queue.pop() as SwaggerReferenceProperty;
    createTs(swagger, findDefinition(swagger, item));
  }

  tsTypes.push(ts);
};

/**
 * convert swagger schema to typescript type
 * 
 * @param swagger original schema
 * @param schema target schema
 */
export const schemaToTs = (
  swagger: Swagger,
  schema: SwaggerSchemaProperty,
): string[] => {
  switch (schema!.type) {
    case "array":
      if (!isSwaggerPrimitiveProperty(schema.items)) {
        createTs(swagger, findDefinition(swagger, schema.items));
        return tsTypes;
      } else {
        throw Error(`unknown type: ${schema.type}`);
      }
    case "object":
      return Object.keys(schema.properties).flatMap((key) =>
        schemaToTs(swagger, schema.properties[key])
      );
    case undefined:
      createTs(swagger, findDefinition(swagger, schema));
      return tsTypes;
    default:
      throw Error(`unknown type: ${schema.type}`);
  }
};

export const swaggerToTs = (swagger: Swagger): string => {
  Object.keys(swagger.paths).forEach((key) => {
    Object.keys(swagger.paths[key]).forEach(async (method) => {
      const schema = swagger.paths[key][method as SwaggerRequestTypes]
        .responses[200]?.schema;
      if (!schema) {
        return;
      }
      schemaToTs(swagger, schema);
    });
  });
  return tsTypes.join("\n\n");
};
