import { createRequire } from "node:module";
  import path from "node:path";
  import { fileURLToPath } from "node:url";
  import { build as esbuild } from "esbuild";
  import esbuildPluginPino from "esbuild-plugin-pino";
  import { rm } from "node:fs/promises";

  globalThis.require = createRequire(import.meta.url);

  const artifactDir = path.dirname(fileURLToPath(import.meta.url));

  const EXTERNAL = [
    "*.node","sharp","better-sqlite3","sqlite3","canvas","bcrypt","argon2","fsevents","re2",
    "farmhash","xxhash-addon","bufferutil","utf-8-validate","ssh2","cpu-features","dtrace-provider",
    "isolated-vm","lightningcss","pg-native","oracledb","mongodb-client-encryption","nodemailer",
    "handlebars","knex","typeorm","protobufjs","onnxruntime-node","@tensorflow/*","@prisma/client",
    "@mikro-orm/*","@grpc/*","@swc/*","@aws-sdk/*","@azure/*","@opentelemetry/*","@google-cloud/*",
    "@google/*","googleapis","firebase-admin","@parcel/watcher","@sentry/profiling-node","@tree-sitter/*",
    "aws-sdk","classic-level","dd-trace","ffi-napi","grpc","hiredis","kerberos","leveldown","miniflare",
    "mysql2","newrelic","odbc","piscina","realm","ref-napi","rocksdb","sass-embedded","sequelize",
    "serialport","snappy","tinypool","usb","workerd","wrangler","zeromq","zeromq-prebuilt",
    "playwright","puppeteer","puppeteer-core","electron",
  ];

  const BANNER = {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
  import __bannerPath from 'node:path';
  import __bannerUrl from 'node:url';

  globalThis.require = __bannerCrReq(import.meta.url);
  globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
  globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
  `,
  };

  const SHARED = {
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: path.resolve(artifactDir, "dist"),
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: EXTERNAL,
    sourcemap: "linked",
    conditions: ["workspace"],
    banner: BANNER,
  };

  async function buildAll() {
    await rm(path.resolve(artifactDir, "dist"), { recursive: true, force: true });

    // Entry 1: full server with app.listen (Railway / local dev)
    await esbuild({
      ...SHARED,
      entryPoints: [path.resolve(artifactDir, "src/index.ts")],
      plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
    });

    // Entry 2: bare app export for Vercel serverless handler
    await esbuild({
      ...SHARED,
      entryPoints: [path.resolve(artifactDir, "src/app.ts")],
      plugins: [],
    });
  }

  buildAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
  