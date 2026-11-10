#!/usr/bin/env node
/**
 * Compila y publica el portal NADF en el S3 + CloudFront del stack nadf-portal-{stage}.
 * Las variables VITE_* se toman de las salidas del stack (no hay secretos: son IDs públicos).
 *
 * Uso: node scripts/deploy.mjs [--stage dev] [--region sa-east-1] [--skip-build]
 * Requiere AWS CLI con credenciales.
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const stage = opt("stage", "dev");
const region = opt("region", "sa-east-1");
const skipBuild = args.includes("--skip-build");

function aws(params) {
  return execFileSync("aws", [...params, "--region", region, "--output", "json"], { encoding: "utf8", shell: process.platform === "win32" });
}

function run(script, scriptArgs, env) {
  execFileSync(process.execPath, [script, ...scriptArgs], { cwd: appDir, stdio: "inherit", env: { ...process.env, ...env } });
}

const stack = JSON.parse(aws(["cloudformation", "describe-stacks", "--stack-name", `nadf-portal-${stage}`]));
const outputs = Object.fromEntries((stack.Stacks[0].Outputs ?? []).map((o) => [o.OutputKey, o.OutputValue]));
for (const key of ["UserPoolId", "UserPoolClientId", "HttpApiUrl", "PortalSiteBucketName", "PortalDistributionId"]) {
  if (!outputs[key]) throw new Error(`El stack nadf-portal-${stage} no expone ${key}`);
}

const env = {
  VITE_NADF_REGION: region,
  VITE_NADF_USER_POOL_ID: outputs.UserPoolId,
  VITE_NADF_USER_POOL_CLIENT_ID: outputs.UserPoolClientId,
  VITE_NADF_API_URL: outputs.HttpApiUrl,
  VITE_NADF_STAGE: stage,
};

if (!skipBuild) {
  console.log(`Compilando portal (${stage})…`);
  run(require.resolve("typescript/bin/tsc"), ["--noEmit", "-p", "tsconfig.json"], env);
  // vite no exporta bin/vite.js; se ubica desde su package.json (que sí está exportado).
  run(resolve(dirname(require.resolve("vite/package.json")), "bin", "vite.js"), ["build"], env);
}

const bucket = outputs.PortalSiteBucketName;
const dist = resolve(appDir, "dist");
console.log(`Publicando en s3://${bucket}…`);
// Archivos con hash: caché larga. index.html y el resto: siempre revalidar.
aws(["s3", "sync", dist, `s3://${bucket}/`, "--delete", "--exclude", "index.html", "--cache-control", "public,max-age=31536000,immutable"]);
aws(["s3", "cp", resolve(dist, "index.html"), `s3://${bucket}/index.html`, "--cache-control", "no-cache", "--content-type", "text/html;charset=utf-8"]);

const invalidation = JSON.parse(
  aws(["cloudfront", "create-invalidation", "--distribution-id", outputs.PortalDistributionId, "--paths", "/index.html", "/"]),
);
console.log(`Invalidación ${invalidation.Invalidation.Id} creada.`);
console.log(`Portal: https://${outputs.PortalDistributionDomain}`);
