#!/usr/bin/env node
/**
 * Limpieza completa de caché y arranque en desarrollo con Turbopack.
 * Usar cuando aparezcan: ChunkLoadError, CLIENT_FETCH_ERROR o "Cannot find module './7787.js'".
 *
 * Uso: npm run dev:clean
 */
const { rmSync, existsSync } = require("fs");
const { resolve } = require("path");
const { execSync } = require("child_process");

const root = resolve(__dirname, "..");

const dirs = [".next", "node_modules/.cache"];
for (const dir of dirs) {
  const full = resolve(root, dir);
  if (existsSync(full)) {
    console.log("Eliminando:", dir);
    try {
      rmSync(full, { recursive: true, force: true });
    } catch (e) {
      console.warn("No se pudo eliminar", dir, e.message);
    }
  }
}

console.log("Iniciando next dev (con Turbopack para evitar ChunkLoadError)...");
execSync("npx next dev --turbo", { cwd: root, stdio: "inherit" });
