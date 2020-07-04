# swagger-to-ts

convert swagger.yml `definitions` to TypeScript type definition.

exported code is format by 'prettier'.

## How to use

```sh
$ deno run --allow-env --allow-read https://raw.githubusercontent.com/KoutaMatsushita/swagger-to-ts/master/cli.ts -i /path/to/swagger.yml | pbcopy

# or

$ deno run --allow-env --allow-read https://raw.githubusercontent.com/KoutaMatsushita/swagger-to-ts/master/cli.ts -i '/path/*/swagger.yml' | pbcopy
```
