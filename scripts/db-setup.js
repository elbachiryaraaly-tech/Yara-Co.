const { execSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const env = { ...process.env, FORCE_COLOR: "1" };

function run(cmd, opts = {}) {
  console.log(">", cmd);
  return execSync(cmd, { cwd: root, stdio: "inherit", env, ...opts });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const useDocker = process.argv.includes("--docker");

  if (useDocker) {
    console.log("Iniciando PostgreSQL con Docker...");
    try {
      run("docker compose up -d");
      console.log("Esperando 12 segundos a que PostgreSQL arranque...");
      await sleep(12000);
    } catch (e) {
      console.error("Fallo. Asegúrate de tener Docker Desktop instalado y en ejecución.");
      process.exit(1);
    }
  } else {
    console.log("Configurando base de datos con PostgreSQL local (puerto 5432)...");
    console.log("Asegúrate de que PostgreSQL está en ejecución y que la base de datos 'yaraluxe' existe.");
    console.log("Si no existe, créala con: psql -U postgres -c \"CREATE DATABASE yaraluxe;\"");
    console.log("");
  }

  console.log("Aplicando esquema (prisma db push)...");
  try {
    run("npx prisma db push");
  } catch (e) {
    if (e.message && e.message.includes("does not exist")) {
      console.error("\nLa base de datos 'yaraluxe' no existe. Créala con:");
      console.error('  psql -U postgres -c "CREATE DATABASE yaraluxe;"');
      console.error("O en pgAdmin: clic derecho en Databases > Create > Database > nombre: yaraluxe");
    }
    throw e;
  }

  console.log("Ejecutando seed...");
  run("npx tsx prisma/seed.ts");

  console.log("Listo. Base de datos YaraLuxe configurada.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
