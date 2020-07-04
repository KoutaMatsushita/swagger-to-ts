import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { primitiveToTs } from "./primitiveToTs.ts";

([
  "string",
  "byte",
  "binary",
  "date",
  "dateTime",
  "password",
] as const).forEach((value) => {
  Deno.test(`can convert ${value} to string`, () => {
    assertEquals(primitiveToTs({ type: value }), "string");
  });
});

([
  "integer",
  "long",
  "float",
  "double",
] as const).forEach((value) => {
  Deno.test(`can convert ${value} to number`, () => {
    assertEquals(primitiveToTs({ type: value }), "number");
  });
});

Deno.test(`can convert boolean to boolean`, () => {
  assertEquals(primitiveToTs({ type: "boolean" }), "boolean");
});
