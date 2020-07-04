import { SwaggerPrimitiveProperty } from "./types.ts";

/**
 * convert swagger primitive type to typescript primitive type
 * 
 * @param property target property
 * @example
 * // returns "number"
 * primitiveToTs({
 *  type: "integer"
 * })
 */
export function primitiveToTs(property: SwaggerPrimitiveProperty): string {
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
}
