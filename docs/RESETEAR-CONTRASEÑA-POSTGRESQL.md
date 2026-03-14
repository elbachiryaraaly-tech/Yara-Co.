# Cómo restablecer la contraseña de PostgreSQL (Windows)

Si no recuerdas la contraseña del usuario **postgres**, puedes poner una nueva siguiendo estos pasos.

---

## Método: editar pg_hba.conf (sin saber la contraseña actual)

### 1. Localizar la carpeta de datos de PostgreSQL

Abre el **Explorador de archivos** y revisa en:

- `C:\Program Files\PostgreSQL\16\data`
- o `C:\Program Files\PostgreSQL\15\data`
- o `C:\Program Files\PostgreSQL\14\data`

(El número es la versión que tengas instalada. Entra en la carpeta que exista.)

### 2. Parar el servicio PostgreSQL

- Pulsa **Win + R**, escribe `services.msc` y Enter.
- Busca un servicio tipo **"PostgreSQL 16"** (o 15, 14).
- Clic derecho → **Detener**.

### 3. Editar pg_hba.conf

- En la carpeta `data` del paso 1, abre el archivo **pg_hba.conf** con el Bloc de notas **como administrador** (clic derecho → Abrir con → Bloc de notas, y si hace falta "Ejecutar como administrador" el Notepad).
- Busca líneas que contengan `scram-sha-256` o `md5` o `password`. Suelen verse así:

  ```
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    all             all             127.0.0.1/32            scram-sha-256
  host    all             all             ::1/128                 scram-sha-256
  ```

- **Sustituye** `scram-sha-256` (o `md5`) por **trust** en las líneas que afecten a conexiones locales, por ejemplo:

  ```
  host    all             all             127.0.0.1/32            trust
  host    all             all             ::1/128                 trust
  ```

- Guarda el archivo y cierra el Bloc de notas.

### 4. Iniciar de nuevo el servicio PostgreSQL

- En **services.msc**, clic derecho en el servicio PostgreSQL → **Iniciar**.

### 5. Conectar sin contraseña y cambiar la contraseña

- Abre **CMD** o **PowerShell**.
- Ve a la carpeta de PostgreSQL (ajusta la versión si es distinta):

  ```cmd
  cd "C:\Program Files\PostgreSQL\16\bin"
  ```

- Conecta y entra al SQL (no te pedirá contraseña mientras esté en `trust`):

  ```cmd
  psql -U postgres -h 127.0.0.1 -p 5432
  ```

- En el prompt de PostgreSQL (`postgres=#`) ejecuta (pon la contraseña que quieras):

  ```sql
  ALTER USER postgres WITH PASSWORD 'TuNuevaContraseña123';
  ```

- Sal de psql:

  ```sql
  \q
  ```

### 6. Volver a pedir contraseña (importante)

- Abre otra vez **pg_hba.conf** (como administrador).
- **Deshaz** el cambio: vuelve a poner **scram-sha-256** (o **md5**) donde habías puesto **trust**.
- Guarda el archivo.
- En **services.msc**, **reinicia** el servicio PostgreSQL.

A partir de ahora la contraseña de **postgres** será la que pusiste en el `ALTER USER`.

---

## Usar la nueva contraseña en YaraLuxe

1. Abre el archivo **.env** del proyecto YaraLuxe.
2. En **DATABASE_URL** pon la contraseña nueva. Si tiene caracteres raros, codifícalos (por ejemplo `@` → `%40`, `#` → `%23`):

   ```env
   DATABASE_URL="postgresql://postgres:TuNuevaContraseña123@127.0.0.1:5432/yaraluxe?schema=public"
   ```

3. En la carpeta del proyecto ejecuta:

   ```bash
   npm run db:create-and-setup
   ```

Con eso la base de datos quedará creada y configurada.
