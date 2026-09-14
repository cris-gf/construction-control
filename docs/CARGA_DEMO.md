# Crear un usuario y cargar su demostración

## Firebase real y sitio online

En el archivo privado `.env`, conserva la configuración pública `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` de tu sitio. Agrega `SEED_EMAIL` y `SEED_PASSWORD` con el usuario deseado. No hay credenciales predeterminadas; la contraseña debe tener al menos 8 caracteres y cumplir la política de tu proyecto Firebase. Si contiene `#` o espacios, enciérrala entre comillas. No uses prefijo `VITE_` para secretos: ese prefijo publica los valores en el navegador.

Con Docker disponible, ejecuta desde la raíz:

```bash
docker compose run --rm --no-deps app node scripts/seed.mjs --production
```

El destino real se activa únicamente con `--production`; toma el proyecto de `VITE_FIREBASE_PROJECT_ID`. El script no depende de `VITE_USE_EMULATORS` y no conecta emuladores en este modo, aunque Compose configure variables locales. Antes de ejecutarlo comprueba que ese proyecto es el mismo que usa tu sitio publicado. Deben estar habilitados Email/Password en Authentication y Firestore con las reglas del repositorio. No necesita una clave privada ni Firebase Admin.

Si la cuenta existe, se autentica con la contraseña indicada. Una contraseña incorrecta detiene la carga sin cambiar la contraseña ni escribir datos. Si no existe, se crea. Después carga una obra **Casa del bosque**, cuatro compras, un trabajador, un pago parcial y un pendiente: ocho documentos bajo `users/{uid}/projects/{projectId}` y sus subcolecciones. Son datos ficticios, con presupuesto Q250,000 y fechas de ejemplo de septiembre de 2026.

La transacción escribe todos los datos de la obra a la vez. Si la obra demo ya existe, no modifica ni duplica registros, incluso si los editaste o eliminaste desde la aplicación. Tampoco toca tus otras obras. La cuenta Auth puede quedar creada si falla Firestore; corrige el problema y repite el comando. La salida muestra el destino, si se creó la obra y conteos leídos del servidor; nunca imprime contraseña.

Abre el sitio online e inicia sesión con esas credenciales. Selecciona **Casa del bosque**. La carga escribe en Firebase directamente: no requiere volver a desplegar Hosting. Cambiar `SEED_PASSWORD` en `.env` no cambia la contraseña de una cuenta existente; para cambiarla usa recuperación de contraseña. Puedes quitar ambas variables del archivo al terminar si no volverás a ejecutar los scripts.

## Emuladores y comprobaciones locales

Crea `.env.local-demo` con `SEED_EMAIL` y `SEED_PASSWORD` de prueba, distintos de los reales. Este archivo también queda excluido de Git y Docker build. Los scripts locales no cargan `.env` por defecto.

```bash
docker compose up -d
docker compose run --rm app node scripts/seed.mjs
docker compose run --rm app node scripts/check-persistence.mjs --capture
```

La cuenta solo existirá en los emuladores, bajo `demo-construction`. Las comprobaciones de persistencia y capturas usan estas mismas variables. Si ejecutas Node 22 fuera de Docker, instala dependencias con `npm ci` y configura `SEED_EMULATOR_HOST=localhost` en `.env.local-demo`. `SEED_ENV_FILE` permite indicar otra ruta privada; variables de proceso tienen precedencia sobre el archivo.

## Revisar y diagnosticar

- `auth/operation-not-allowed`: habilita Email/Password en Firebase Authentication.
- `auth/invalid-credential`: revisa correo y contraseña de la cuenta existente.
- `auth/password-does-not-meet-requirements`: usa una contraseña que cumpla la política Firebase.
- `permission-denied`: revisa que las reglas desplegadas permitan al usuario leer/escribir sus propias obras.
- Configuración faltante: completa las variables; el script no utiliza credenciales de respaldo.

El script no cambia reglas, habilita servicios ni despliega la aplicación. `.env`, `.env.local-demo` y sus variantes se excluyen con `.gitignore` y `.dockerignore`. Revisa siempre `git diff --cached` antes de publicar cambios.

## Pruebas del aprovisionamiento

```bash
docker compose run --rm app npm run test:seed
docker compose run --rm app npm run test:seed:integration
```

La integración genera credenciales efímeras en memoria y comprueba creación, conteos, repetición y rechazo de contraseña incorrecta en emuladores; no usa las credenciales reales de `.env`.
