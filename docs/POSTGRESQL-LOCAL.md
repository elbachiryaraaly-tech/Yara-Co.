# PostgreSQL local – YaraLuxe

El proyecto está configurado para usar **PostgreSQL instalado en tu PC** (puerto **5432**).

## 1. Comprobar que PostgreSQL está en ejecución

- **Windows**: Abre "Servicios" y verifica que el servicio "postgresql-x64-16" (o tu versión) esté en ejecución.
- O en PowerShell: `Get-Service -Name postgresql*`

## 2. Crear la base de datos (solo la primera vez)

Si la base de datos `yaraluxe` no existe, créala:

**Opción A – Línea de comandos (psql)**  
Abre "SQL Shell (psql)" desde el menú de PostgreSQL o en una terminal:

```bash
psql -U postgres -c "CREATE DATABASE yaraluxe;"
```

Si te pide contraseña, usa la que configuraste al instalar PostgreSQL.

**Opción B – pgAdmin**  
1. Abre pgAdmin.  
2. Conecta a tu servidor local.  
3. Clic derecho en **Databases** → **Create** → **Database**.  
4. Nombre: `yaraluxe` → Save.

## 3. Usuario y contraseña en `.env`

En el archivo `.env` del proyecto está:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/yaraluxe?schema=public"
```

- Si tu usuario de PostgreSQL **no** es `postgres`, cambia el primero.  
- Si tu contraseña **no** es `postgres`, cámbiala en la URL.  
- Si PostgreSQL usa otro puerto, cambia `5432` por ese puerto.

## 4. Aplicar esquema y datos iniciales

En la carpeta del proyecto:

```bash
npm run db:push
npm run db:seed
```

O todo en uno (sin Docker):

```bash
npm run db:setup:local
```

## 5. Si antes usabas Docker (puerto 5433)

El `.env` ya está configurado para PostgreSQL local (puerto 5432).  
Si quieres volver a usar Docker: cambia en `.env` el puerto a `5433` y ejecuta `docker compose up -d` y luego `npm run db:push`.
