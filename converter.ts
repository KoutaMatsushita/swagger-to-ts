import {
  SwaggerObjectProperty,
  isSwaggerPrimitiveProperty,
  Swagger,
  SwaggerSchemaProperty,
  SwaggerRequestTypes,
  SwaggerReferenceProperty,
  isSwaggerEnumProperty,
  SwaggerArrayProperty,
} from "./types.ts";
import { getDefinitionName, findDefinition } from "./findDefinition.ts";
import { primitiveToTs } from "./primitiveToTs.ts";
import { enumToTs } from "./enumToTs.ts";

const queue: SwaggerReferenceProperty[] = [];
const convertedKeys: string[] = [];
const tsTypes: string[] = [];

export function arrayToTs(
  swagger: Swagger,
  property: SwaggerArrayProperty,
): string {
  if (isSwaggerPrimitiveProperty(property.items)) {
    return `${primitiveToTs(property.items)}[]`;
  } else if (property.items.type == "object") {
    return `{\n${objectToTsParams(swagger, property.items)}}[]`;
  } else if (property.items.type == "array") {
    return `${arrayToTs(swagger, property.items)}[]`;
  } else {
    queue.push(property.items);
    return `${getDefinitionName(property.items)}[]`;
  }
}

/**
 * convert swagger object type to typescript object type
 * 
 * @param swagger original schema
 * @param properties target object property
 */
export function objectToTsParams(
  swagger: Swagger,
  { properties }: SwaggerObjectProperty,
): string {
  let ts = "";
  Object.keys(properties).forEach((key) => {
    const property = properties[key];
    if (isSwaggerEnumProperty(property)) {
      ts += `${key}: ${enumToTs(property)};\n`;
    } else if (isSwaggerPrimitiveProperty(property)) {
      ts += `${key}: ${primitiveToTs(property)};\n`;
    } else {
      switch (property.type) {
        case "array":
          if (isSwaggerPrimitiveProperty(property.items)) {
            ts += `${key}: ${primitiveToTs(property.items)}[];\n`;
          } else {
            if (property.items.type == "object") {
              let _ts = "";
              const nestedProperties = property.items.properties;
              Object.keys(nestedProperties).forEach((_key) => {
                const nestedProperty = nestedProperties[_key];
                switch (nestedProperty.type) {
                  case "object":
                    _ts += `${_key}: {\n${
                      objectToTsParams(swagger, nestedProperty)
                    };\n};\n`;
                    break;
                  case "array":
                    _ts += `${_key}: ${arrayToTs(swagger, nestedProperty)}`;
                    break;
                  case undefined:
                    queue.push(nestedProperty);
                    _ts += `${_key}: ${getDefinitionName(nestedProperty)};\n`;
                    break;
                  default:
                    break;
                }
              });
              ts += `${key}: {\n${_ts}};\n`;
            } else if (property.items.type == "array") {
              throw Error();
            } else {
              queue.push(property.items);
              ts += `${key}: ${getDefinitionName(property.items)}[];\n`;
            }
          }
          break;
        case "object":
          ts += `${key}: {\n${objectToTsParams(swagger, property)}};\n`;
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
}

/**
 * create typescript type
 * 
 * @param swagger original schema
 * @param param0 
 */
function createTs(
  swagger: Swagger,
  { key, property }: { key: string; property: SwaggerSchemaProperty },
) {
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
        throw Error();
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
}

/**
 * convert swagger schema to typescript type
 * 
 * @param swagger original schema
 * @param schema target schema
 */
function schemaToTs(
  swagger: Swagger,
  schema: SwaggerSchemaProperty,
): string[] {
  switch (schema!.type) {
    case "array":
      if (
        !isSwaggerPrimitiveProperty(schema.items) &&
        schema.items.type == undefined
      ) {
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
}

export const swaggerToTs = (swagger: Swagger): string => {
  tsTypes.length = 0;
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
