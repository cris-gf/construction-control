# Obra · Control de construcción

PWA en español para cuentas, compras, pendientes y mano de obra. React + TypeScript estricto + Firebase Authentication/Firestore. Moneda GTQ, zona America/Guatemala. Sin Cloud Functions, Storage, SMS ni servicios de pago.

## Documentación

- [Manual de usuario](docs/MANUAL_USUARIO.md): operación paso a paso, ejemplos de abonos, uso offline, calendario y respaldos.
- [Guía técnica](docs/GUIA_TECNICA.md): mapa de código, arquitectura, modelo de datos, ajustes habituales, pruebas y diagnóstico.
- [Decisiones y límites](DECISIONS.md) y [resultados de verificación](VERIFICATION.md).

## Arranque con Docker (camino principal)

Requisitos del anfitrión: Git y Docker Desktop con Docker Compose. No se instala Node, Java ni Firebase CLI globalmente. Docker Desktop debe estar iniciado. La primera compilación descarga dependencias, Java y Chromium y puede tardar varios minutos.

```bash
cd /Users/crisgf/projects/construction-control
docker compose up --build
```

- Aplicación: http://localhost:5173
- Firebase Emulator UI: http://localhost:4000
- Authentication: http://localhost:9099
- Firestore: http://localhost:8080
- Hosting (puerto 5002 para evitar AirPlay de macOS): http://localhost:5002 (sirve `dist`, disponible tras compilar)

Crea una cuenta desde la aplicación y luego una obra. Opcionalmente ejecuta `docker compose run --rm app node scripts/seed.mjs` para crear datos de demostración separados (correo `demo@obra.local`, contraseña local `ObraDemo2026!`). El script se conecta exclusivamente a los emuladores. Los emuladores usan el proyecto ficticio `demo-construction`; no hace falta Firebase Console ni tarjeta. El correo de recuperación aparece en los registros del emulador Auth, no se envía por email. Nunca reutilices contraseñas reales en los emuladores.

La imagen usa Node 22.19.0 y JDK 21.0.8, admite ARM64 y x86_64 sin fijar arquitectura. `npm ci` instala el archivo de bloqueo durante el build; el arranque no modifica el lockfile. Código montado para HMR, dependencias en volumen nombrado, procesos con `init: true` y usuario node. Compose espera que Auth, Firestore y Hosting estén disponibles.

## Comandos completos

Desde la carpeta del proyecto, con Docker iniciado:

```bash
docker compose up -d --build
docker compose run --rm app npm run lint
docker compose run --rm app npm run typecheck
docker compose run --rm app npm test
docker compose run --rm app npm run test:rules
docker compose run --rm app npm run build
# Chromium dentro del contenedor; navegador apunta al emulador por nombre Docker.
docker compose run --rm -e VITE_EMULATOR_HOST=emulators app npm run test:e2e
# Volver a generar dist para acceder desde el navegador del anfitrión:
docker compose run --rm app npm run build
# Producción local / PWA, en http://localhost:4173:
docker compose run --rm -p 4173:4173 app npm run preview
# Logs, incluidos los enlaces de recuperación de contraseña:
docker compose logs -f emulators
# Detener conservando cuentas y datos:
docker compose down
```

**Destructivo: el siguiente comando borra todos los datos locales de emuladores y los volúmenes de dependencias/caché:**

```bash
docker compose down -v
```

Auth y Firestore se exportan al detener normalmente el emulador y se importan al arrancar, desde el volumen `emulator_data`. Permite que termine el apagado (hasta 60 segundos). No uses `kill -9` ni cierres forzadamente Docker: un cierre abrupto puede perder cambios desde la última exportación. Los datos del navegador se administran por separado; borrar datos del sitio elimina la cola offline local.

Si cambias dependencias, reconstruye y actualiza el volumen sin borrar los emuladores:

```bash
docker compose build
docker compose run --rm --no-deps app npm ci
```

## Uso desde teléfono e instalación

En desarrollo el frontend usa `localhost` como host de emuladores accesible desde el navegador. Para otro equipo en la LAN configura `VITE_EMULATOR_HOST` con la IP del equipo Docker y abre su puerto 5173. Solo usa redes de confianza: los emuladores no se exponen a Internet.

Los service workers requieren HTTPS o localhost. Para **instalación real en un teléfono**, usa el despliegue HTTPS de Firebase Hosting o un certificado HTTPS local de confianza; HTTP sobre una IP de LAN no permite instalar el service worker. La PWA se comprueba en la compilación de producción, no en el servidor HMR. Chrome: menú → Instalar aplicación. iPhone: Compartir → Agregar a inicio. Iconos PNG de 192 y 512 px y manifest incluidos.

Activa “dispositivo de confianza” al iniciar sesión para habilitar IndexedDB. La primera carga y autenticación requieren red. Después, las consultas ya cargadas y las escrituras funcionan offline. La interfaz diferencia conexión, caché, cambios pendientes y confirmación del servidor. No borres datos del sitio mientras haya cambios pendientes. Sin permiso de confianza se usa caché en memoria.

## Funciones

- Obras con presupuesto, fechas y estado; selector activo.
- Resumen de gastos pagados, saldos comprometidos, disponible y alertas 80/90/100 %.
- Compras editables, borrado lógico, búsqueda y filtros de material/proveedor/categoría/pago/fechas.
- Comparación de precios del mismo material y unidad; diferencia, porcentaje y ahorro por cantidad.
- Pendientes y recepción, cambio rápido de estado, conversión atómica a compra, eventos de calendario `.ics` con recordatorio 30 minutos antes.
- Trabajadores y compromisos con abonos acumulados; historial y saldos por trabajador.
- CSV de la obra activa (montos en centavos identificados por columna) y JSON versionado con vista previa de importación.
- Importación a obra nueva, validación Zod, remapeo de todos los IDs y enlaces, ninguna identidad del archivo se acepta como autoridad.

## Seguridad y arquitectura

`src/domain.ts`: tipos, schemas y aritmética. `src/firebase.ts`: sesiones, persistencia por UID y escrituras por ruta. `src/App.tsx`: consultas y pantallas privadas. `src/forms.tsx`: formularios y validación. `src/backup.ts`: JSON/CSV/ICS. `firestore.rules`: denegación por defecto, validación de propietario, campos críticos y versión.

Los documentos están bajo `users/{uid}/projects/{projectId}`; las subcolecciones son purchases, pendingItems, workers, laborPayments, suppliers y materials. No existen rutas globales de usuarios accesibles ni roles administrativos. El borrado lógico conserva relaciones y permite sincronizar. Los totales se derivan de documentos no eliminados; nunca se almacenan agregados duplicados.

Cada cuenta usa una Firebase App nombrada con su UID, lo que separa físicamente su IndexedDB. La autenticación de esa app recibe únicamente la sesión actual. Al salir se cierran las sesiones de apps de datos y se desmonta todo el estado privado. Los datos persistidos siguen en el dispositivo para recuperar trabajo pendiente de esa cuenta: esto no es cifrado ni protege contra alguien con acceso al perfil del navegador. Solo dispositivos de confianza.

Las versiones son incrementales, validadas en reglas contra la versión anterior. Si otro dispositivo guardó antes, el servidor rechaza el formulario obsoleto. Offline, el SDK puede mostrar provisionalmente el cambio antes de que el servidor lo rechace; el error indica recargar el registro y volver a aplicar la edición. No se presenta ese cambio provisional como confirmado.

Consulta [DECISIONS.md](DECISIONS.md) para límites y decisiones.

## Firebase Spark y despliegue (solo cuando el propietario lo decida)

1. Crea un proyecto en Firebase Console con plan **Spark**, sin habilitar facturación.
2. Registra una app web. Habilita Authentication → Email/Password.
3. Crea Cloud Firestore en modo producción y elige su región antes de cargar datos.
4. Copia `.env.example` a `.env`, rellena la configuración **pública** del SDK y usa `VITE_USE_EMULATORS=false`. No agregues cuentas de servicio, claves privadas ni secretos.
5. Compila con emuladores desactivados (Compose configura true por defecto; este override es obligatorio):

```bash
docker compose run --rm -e VITE_USE_EMULATORS=false app npm run build
```

6. Cuando quieras desplegar explícitamente, inicia sesión en Firebase CLI dentro de Docker y despliega solo reglas, índices y Hosting. Sustituye `TU_PROJECT_ID`:

```bash
docker compose run --rm -e VITE_USE_EMULATORS=false app sh -c 'npx firebase login --no-localhost && npx firebase deploy --project TU_PROJECT_ID --only firestore:rules,firestore:indexes,hosting'
```

El SDK toma las variables de `.env` durante la compilación. No subas `.env` a Git. Agrega tu dominio en los dominios autorizados de Authentication. Los índices compuestos están vacíos porque las consultas están acotadas al proyecto y los filtros se hacen localmente. Evita importar datos de demostración en producción. Esta entrega no crea recursos reales ni habilita Blaze.

Referencias: [persistencia offline de Firestore](https://firebase.google.com/docs/firestore/manage-data/enable-offline), [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure).

## Resultados de verificación

Consulta [VERIFICATION.md](VERIFICATION.md) para resultados, alcance de las pruebas y comandos de reproducción.
