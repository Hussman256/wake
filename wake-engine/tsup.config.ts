import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
  },
  {
    entry: { "cli/index": "cli/index.ts" },
    format: ["esm"],
    sourcemap: true,
    banner: { js: "#!/usr/bin/env node" },
  },
]);
