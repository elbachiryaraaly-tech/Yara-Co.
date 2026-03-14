const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) throw new Error(".env no encontrado");
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/DATABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
  if (!match) throw new Error("DATABASE_URL no encontrado en .env");
  return match[1];
}

function parseDbUrl(url) {
  try {
    const u = new URL(url.replace(/^postgresql:\/\//, "postgres://"));
    return {
      host: u.hostname || "127.0.0.1",
      port: parseInt(u.port || "5432", 10),
      user: u.username || "postgres",
      password: u.password || "",
      database: u.pathname ? u.pathname.slice(1).replace(/\?.*$/, "") : "postgres",
    };
  } catch (e) {
    throw new Error("DATABASE_URL inválida: " + e.message);
  }
}

async function createDatabaseIfNeeded() {
  const databaseUrl = loadEnv();
  const config = parseDbUrl(databaseUrl);
  const dbName = config.database;

  if (dbName === "postgres") {
    console.log("DATABASE_URL apunta a la base 'postgres'. No se crea ninguna base nueva.");
    return;
  }

  const { Client } = require("pg");
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: "postgres",
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log("Base de datos '" + dbName + "' creada.");
    } else {
      console.log("Base de datos '" + dbName + "' ya existe.");
    }
  } catch (e) {
    if (e.code === "28P01" || (e.message && e.message.includes("autentificaci") && e.message.includes("fall"))) {
      console.error("\n*** Contraseña incorrecta para PostgreSQL. ***");
      console.error("Abre .env y ajusta DATABASE_URL con tu usuario y contraseña real de PostgreSQL.");
      console.error("Ejemplo: postgresql://postgres:TU_CONTRASEÑA@127.0.0.1:5432/yaraluxe?schema=public");
      console.error("Luego crea la base manualmente: psql -U postgres -c \"CREATE DATABASE yaraluxe;\"");
      console.error("Y ejecuta: npm run db:push && npm run db:seed\n");
      throw e;
    }
    console.error("Error al crear la base de datos:", e.message);
    throw e;
  } finally {
    await client.end();
  }
}

function run(cmd, opts = {}) {
  console.log(">", cmd);
  return execSync(cmd, { cwd: root, stdio: "inherit", env: process.env, ...opts });
}

async function main() {
  const databaseUrl = loadEnv();
  const isSqlite = databaseUrl.startsWith("file:");

  console.log("=== Configuración completa de la base de datos YaraLuxe ===\n");

  if (!isSqlite) {
    console.log("1. Creando base de datos si no existe...");
    await createDatabaseIfNeeded();
  } else {
    console.log("1. SQLite detectado (no se crea base externa).");
  }

  console.log("\n2. Generando cliente Prisma...");
  run("npx prisma generate");

  console.log("\n3. Aplicando esquema (prisma db push)...");
  run("npx prisma db push");

  console.log("\n4. Ejecutando seed...");
  run("npx tsx prisma/seed.ts");

  console.log("\n=== Listo. Base de datos configurada. ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
