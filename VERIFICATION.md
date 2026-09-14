# Verificación local

Verificado en Docker sobre macOS Apple Silicon el 14 de septiembre de 2026. No se utilizaron instalaciones globales de Node, Java ni Firebase CLI. No se desplegó a producción.

| Comprobación | Resultado |
| --- | --- |
| ESLint | Sin errores |
| TypeScript estricto | Sin errores |
| Build de producción / PWA | Correcto; service worker con 12 recursos precacheados |
| Vitest: dominio y formulario | 14 pruebas aprobadas |
| Firebase Emulator: reglas | 5 pruebas aprobadas; accesos cruzados rechazados en las siete ramas de negocio |
| Playwright / Chromium | 4 flujos aprobados |
| Auditoría de dependencias de producción | 0 vulnerabilidades reportadas |
| Reinicio de Docker | Cuenta, UID y obra idénticos después de `down` y `up` |
| HMR | Cambio en el código montado aplicado sin recargar la página |
| Revisión visual | Escritorio 1440 px y móvil 390 px; prueba de ancho a 320 px |

Los mensajes `PERMISSION_DENIED` de las pruebas de reglas son rechazos esperados, comprobados con `assertFails`.

Los flujos Playwright verifican registro de dos usuarios aislados, compra exacta de Q2,519.65, edición y borrado, cierre de sesión, bloqueo de rutas privadas, conversión de pendiente sin doble conteo, descarga ICS, trabajador con abono y saldo, exportación e importación de respaldo, manifest PWA, recarga offline, creación y edición offline, reconexión y ausencia de duplicación.

La instalación mediante el menú nativo de iOS/Android requiere probarla en el teléfono del propietario sobre HTTPS. Se verifican automáticamente el manifest, los iconos, el service worker y la operación offline en Chromium, sin afirmar una instalación nativa no realizada.

## Repetir las pruebas

```bash
docker compose up -d --build
docker compose run --rm app npm run lint
docker compose run --rm app npm run typecheck
docker compose run --rm app npm test
docker compose run --rm app npm run test:rules
docker compose run --rm -e VITE_EMULATOR_HOST=emulators app npm run test:e2e
docker compose run --rm app npm run build
```

Prueba de persistencia (los datos de ejemplo se crean exclusivamente en los emuladores):

```bash
docker compose run --rm app node scripts/seed.mjs
docker compose run --rm app node scripts/check-persistence.mjs --capture
docker compose down
docker compose up -d
docker compose run --rm app node scripts/check-persistence.mjs
```

Ejecuta captura y comparación sin ejecutar Playwright entre ambas: Playwright limpia su carpeta `test-results` al comenzar.

La auditoría completa de herramientas de desarrollo también se revisó: quedan 11 avisos moderados en dependencias transitivas de Firebase CLI y Vitest. No forman parte del bundle de producción. No se aplicó la sugerencia automática de degradar Firebase CLI a una versión mayor antigua; actualizar estas herramientas requiere volver a ejecutar las pruebas. Los avisos altos y críticos encontrados en las versiones iniciales se corrigieron.

## Ajuste de credenciales y carga demo — 14 septiembre 2026

- Lint, TypeScript y compilación PWA: correctos.
- 14 pruebas de dominio/formulario, 5 de reglas y 4 flujos Playwright: correctos.
- 6 pruebas de configuración privada: correctas.
- Integración de aprovisionamiento en emuladores: cuenta nueva, ocho documentos leídos del servidor, repetición sin duplicados y contraseña incorrecta rechazada.
- Credenciales fijas retiradas del código y manuales actuales; variables privadas excluidas de Git. Los commits históricos conservan los antiguos ejemplos locales, que no se usan para aprovisionar usuarios reales.
- El primer intento Playwright encontró el puerto 4173 ocupado; la ejecución en un contenedor independiente pasó los cuatro flujos.
- La carga online requiere completar SEED_EMAIL y SEED_PASSWORD en el archivo privado .env; estas pruebas locales no prueban que exista una cuenta online.
