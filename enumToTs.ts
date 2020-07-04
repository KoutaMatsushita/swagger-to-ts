import { SwaggerEnumProperty } from "./types.ts";

/**
 * convert swagger enum type to typescript union type
 * 
 * @param property target property
 * @example
 * // returns "\"Admin\" | \"User\""
 * enumToTs({
 *  type: "string",
 *  enum: ["Admin", "User"]
 * })
 */
export function enumToTs(property: SwaggerEnumProperty): string {
  switch (property.type) {
    case "integer":
      return property.enum.join(" | ");
    case "string":
      return property.enum.map((str) => `"${str}"`).join(" | ");
    default:
      const _exhaustiveCheck: never = property.type;
      return _exhaustiveCheck;
  }
}
