import args from "https://deno.land/x/args@2.0.2/wrapper.ts";
import {
  EarlyExitFlag,
  Option,
} from "https://deno.land/x/args@2.0.2/flag-types.ts";
import {
  prettier,
  prettierPlugins,
} from "https://denolib.com/denolib/prettier/prettier.ts";
import { Text } from "https://deno.land/x/args@2.0.2/value-types.ts";
import { PARSE_FAILURE } from "https://deno.land/x/args@2.0.2/symbols.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { readFileStrSync } from "https://deno.land/std/fs/read_file_str.ts";
import { expandGlobSync } from "https://deno.land/std/fs/expand_glob.ts";
import { parse } from "https://deno.land/std/encoding/yaml.ts";
import { Swagger } from "./types.ts";
import { swaggerToTs } from "./converter.ts";

const parser = args
  .describe("swagger.yml to typescript type")
  .with(EarlyExitFlag("help", {
    alias: ["h"],
    describe: "Show help",
    exit() {
      console.log("USAGE:");
      console.log("  deno -A cli.ts [options] ...files");
      console.log(parser.help());
      return Deno.exit(0);
    },
  }))
  .with(Option("input", {
    type: Text,
    alias: ["i"],
    describe: "swagger.yml path",
  }));
const parserRes = parser.parse(Deno.args);

if (parserRes.tag === PARSE_FAILURE) {
  console.error(parserRes.error.toString());
  Deno.exit(1);
} else {
  const getTargetPath = (filePath: string) => {
    if (filePath[0] == "~") {
      return path.join(Deno.env.get("HOME")!, filePath.slice(1));
    } else {
      return path.resolve(Deno.env.get("PWD")!, filePath);
    }
  };

  for (const walk of expandGlobSync(getTargetPath(parserRes.value.input))) {
    const file = readFileStrSync(walk.path);
    const swagger = parse(file) as Swagger;
    const ts = prettier.format(swaggerToTs(swagger), {
      parser: "babel",
      plugins: prettierPlugins,
    });
    console.log(ts);
  }
}
