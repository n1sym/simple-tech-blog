---
title: Astro の Failed to resolve entry for package "fs" というエラーを解決したメモ
date: "2022-11-03"
---

Astro に fs を導入して、`npm run build` を実行したら以下のエラーが出た。 

~~~
 error   Failed to resolve entry for package "fs". The package may have incorrect main/module/exports specified in its package.json.
  File:
    file
  Stacktrace:
Error: Failed to resolve entry for package "fs". The package may have incorrect main/module/exports specified in its package.json.
    at packageEntryFailure (file:///vercel/path0/front/node_modules/vite/dist/node/chunks/dep-c842e491.js:35293:11)
    at resolvePackageEntry (file:///vercel/path0/front/node_modules/vite/dist/node/chunks/dep-c842e491.js:35290:5)
    at tryNodeResolve (file:///vercel/path0/front/node_modules/vite/dist/node/chunks/dep-c842e491.js:35031:20)
    at Object.resolveId (file:///vercel/path0/front/node_modules/vite/dist/node/chunks/dep-c842e491.js:34792:28)
    at Object.handler (file:///vercel/path0/front/node_modules/vite/dist/node/chunks/dep-c842e491.js:46785:19)
    at file:///vercel/path0/front/node_modules/rollup/dist/es/shared/rollup.js:22748:40
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
Error: Command "npm run build" exited with 1
~~~

ログを見ると vite のエラーっぽいので調べてみると、https://github.com/vitejs/vite/issues/4037 あたりが近そう。

以下を追加したら解決した。

~~~js
// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["fs", "path"],
    },
  },
});
~~~