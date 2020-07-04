import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { arrayToTs } from "./converter.ts";
import { Swagger } from "./types.ts";

const dummySwagger: Swagger = {
  swagger: "",
  paths: {},
  definitions: {
    ref: {
      type: "object",
      properties: {
        integer: {
          type: "integer",
        },
      },
    },
  },
};

Deno.test(`can convert integer array to array`, () => {
  const actual = arrayToTs(
    dummySwagger,
    { type: "array", items: { type: "integer" } },
  );
  assertEquals(actual, "number[]");
});

Deno.test(`can convert object array to array`, () => {
  const actual = arrayToTs(
    dummySwagger,
    {
      type: "array",
      items: {
        type: "object",
        properties: {
          integer: {
            type: "integer",
          },
          string: {
            type: "string",
          },
        },
      },
    },
  );
  assertEquals(actual, "{\ninteger: number;\nstring: string;\n}[]");
});

Deno.test({
  name: `can convert ref array to array(TODO)`,
  ignore: true,
  fn() {
    // TODO
  },
});
