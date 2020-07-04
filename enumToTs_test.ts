import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { enumToTs } from "./enumToTs.ts";

Deno.test(`can convert string emun to union`, () => {
  assertEquals(
    enumToTs({ type: "string", enum: ["Admin", "User"] }),
    '"Admin" | "User"',
  );
});

Deno.test(`can convert integer emun to union`, () => {
  assertEquals(
    enumToTs({ type: "integer", enum: ["1", "2", "3"] }),
    "1 | 2 | 3",
  );
});
