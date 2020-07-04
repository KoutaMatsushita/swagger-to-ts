import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Swagger } from "./types.ts";
import { objectToTsParams } from "./converter.ts";

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

Deno.test("can convert object in primitive to string", () => {
  const actual = objectToTsParams(dummySwagger, {
    type: "object",
    properties: {
      integer: {
        type: "integer",
      },
      string: {
        type: "string",
      },
    },
  });
  assertEquals(actual.trim(), "integer: number;\nstring: string;");
});

Deno.test("can convert object in primitive array to string", () => {
  const actual = objectToTsParams(dummySwagger, {
    type: "object",
    properties: {
      array: {
        type: "array",
        items: {
          type: "integer",
        },
      },
    },
  });
  assertEquals(actual.trim(), "array: number[];");
});

Deno.test("can convert object in object to string", () => {
  const actual = objectToTsParams(dummySwagger, {
    type: "object",
    properties: {
      object: {
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
  });
  assertEquals(
    actual.trim(),
    "object: {\ninteger: number;\nstring: string;\n};",
  );
});

Deno.test("can convert object in object in array to string", () => {
  const actual = objectToTsParams(dummySwagger, {
    type: "object",
    properties: {
      object: {
        type: "object",
        properties: {
          array: {
            type: "array",
            items: {
              type: "integer",
            },
          },
        },
      },
    },
  });
  assertEquals(
    actual.trim(),
    "object: {\narray: number[];\n};",
  );
});

Deno.test({
  name: "can convert object in ref to string(TODO)",
  ignore: true,
  fn() {
    // TODO
  },
});
