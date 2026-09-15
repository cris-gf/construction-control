# Arquitectura y mantenimiento

La aplicación se organiza por responsabilidad y funcionalidad. `src/app/App.tsx` decide si mostrar autenticación o el espacio privado; las pantallas ya no viven dentro de ese archivo. La separación conserva el modelo Firestore, los identificadores, los estados guardados, los respaldos versión 1 y el aislamiento por usuario. No requiere migrar datos existentes.

## Dónde realizar cada ajuste

| Cambio | Archivo o carpeta |
| --- | --- |
| Nombre de la marca, formatos, avisos y límites generales | [`src/config/appConfig.ts`](../src/config/appConfig.ts) |
| Texto de botones, títulos, mensajes y etiquetas | [`src/locales/es`](../src/locales/es) |
| URL de una pantalla | [`src/config/routes.ts`](../src/config/routes.ts) |
| Etiqueta, icono y orden del menú | [`src/config/navigation.ts`](../src/config/navigation.ts) |
| Campos visibles de cada formulario | [`src/config/recordFields.ts`](../src/config/recordFields.ts) |
| Validación de un registro | [`src/domain/schemas.ts`](../src/domain/schemas.ts) y [`firestore.rules`](../firestore.rules) |
| Estados y opciones almacenadas | [`src/domain/options.ts`](../src/domain/options.ts), `pendingStates` en [`schemas.ts`](../src/domain/schemas.ts) |
| Cálculos monetarios y resumen | [`src/domain/money.ts`](../src/domain/money.ts), [`calculations.ts`](../src/domain/calculations.ts) |
| Fechas y eventos ICS | [`src/domain/dates.ts`](../src/domain/dates.ts), [`calendar.ts`](../src/domain/calendar.ts) |
| Interfaz de una funcionalidad | [`src/features`](../src/features) |
| Controles compartidos | [`src/components`](../src/components) |
| Suscripciones, cambios de obra y estado de sincronización | [`src/hooks/useWorkspaceData.ts`](../src/hooks/useWorkspaceData.ts) |
| Guardar, eliminar, convertir pendientes y detectar conflictos | [`src/hooks/useWorkspaceActions.tsx`](../src/hooks/useWorkspaceActions.tsx) |
| Firebase, sesión y exportación de archivos | [`src/services`](../src/services) |
| Parsear y preparar importaciones | [`src/features/backup`](../src/features/backup) |
| Apariencia y adaptación móvil | [`src/styles`](../src/styles), entrada única [`index.css`](../src/styles/index.css) |

## Estructura

```text
src/
  app/             Entrada autenticada, composición de pantallas y sidebar
  components/      Brand, StatCard, PaymentBadge, RecordActions, Editor, FieldInput, Empty
  config/          Ajustes públicos, rutas, navegación y descriptores de campos
  domain/          Schemas, tipos, cálculos, fechas, calendario y errores tipados
  features/
    auth/          Pantalla y controlador de autenticación
    dashboard/     Presupuesto, distribución, agenda y compras recientes
    purchases/     Historial y filtros de compras
    pending/       Pendientes, conversión y calendario
    team/          Trabajadores y pagos
    prices/        Comparación de precios
    backup/        Interfaz, validación JSON y preparación de importación
  hooks/           Estado compartido del espacio de trabajo
  locales/es/      Catálogos tipados de textos por funcionalidad
  services/        Integraciones Firebase, sesión y archivos
  styles/          Base, formularios, autenticación, workspace y adaptación móvil
```

Las dependencias van desde la interfaz hacia los hooks, servicios y dominio. El dominio no importa React, Firebase ni pantallas. Los componentes compartidos no importan funcionalidades concretas. Los servicios comunes tampoco dependen de pantallas. Las importaciones relativas y los tipos explícitos permiten seguir el recorrido sin un contenedor de dependencias ni un gestor global adicional.

`tests/architecture.test.ts` comprueba estas fronteras y la ausencia de ciclos. `domain/index.ts` es la entrada pública del dominio; dentro de esa carpeta, usa importaciones directas para evitar ciclos a través del propio índice. No añadas exportaciones generales que hagan que una funcionalidad termine dependiendo de todas las demás.

## Configuración pública en código

Edita `appConfig` directamente. Por ejemplo, dentro de `dashboard`:

```ts
recentPurchases: 6,
agendaItems: 4,
budgetWarningPercent: 75,
budgetCriticalPercent: 90,
budgetExceededPercent: 100,
```

Eso cambia cuántos elementos aparecen en el resumen y cuándo se muestran los avisos. Los mensajes asociados a límites y la etiqueta de moneda de los formularios toman los valores de configuración. No necesitas agregar variables `.env` para estos ajustes. Vite los actualiza en desarrollo; el sitio publicado necesita una nueva compilación y publicación para incorporarlos.

Las secciones disponibles son:

- `brand`: nombre y lema usados por el componente compartido de marca y el pie. Los textos editoriales que mencionan Obra se editan en los catálogos.
- `formatting`: formatos numéricos, formato de fecha y símbolo monetario.
- `calendar`: zona horaria, desfase UTC, duración y anticipación del recordatorio.
- `dashboard`: cantidad de compras/actividades y umbrales de presupuesto.
- `auth`: longitud mínima que solicita el formulario; Firebase sigue aplicando la política configurada en su servidor.
- `backup`: tamaño máximo del archivo, cantidad de registros y vida de la URL de descarga.
- `validation`: longitudes y techo de importes, coordinados con las reglas del servidor.
- `storage`: clave del dispositivo de confianza; cambiarla olvida esa preferencia local.

Mantén los umbrales de presupuesto en orden ascendente. La importación escribe una obra y todos sus registros en un lote: no configures más de 499 registros; el valor predeterminado deja margen con 450. Un cambio de validación que admita datos más amplios exige actualizar también `firestore.rules` y probar ambos lados.

Los importes siguen siendo centavos con dos decimales; cambiar el símbolo no convierte datos ni añade soporte multimoneda. Las fechas están diseñadas para Guatemala con desfase fijo: zona horaria y `utcOffset` deben ser coherentes. Para una región con horario estacional habría que adaptar la conversión de fechas, además de editar configuración.

Las credenciales de aprovisionamiento y la configuración de Firebase continúan en `.env`, según [CARGA_DEMO.md](CARGA_DEMO.md). `appConfig` es código público incluido en el navegador: nunca coloques contraseñas ahí.

## Cambiar textos

Cada funcionalidad importa un catálogo tipado. Por ejemplo, el título del resumen está en `src/locales/es/workspace.ts`:

```ts
overviewTitle: "Todo bajo control.",
```

Puedes editar su contenido conservando la clave. Para mensajes con valores variables utiliza una función y recibe esos valores como argumentos:

```ts
deadline: (date: string) => `Límite: ${date}`,
```

Evita decidir el comportamiento a partir de palabras del mensaje. El editor utiliza `RecordConflictError`, por lo que cambiar la redacción del conflicto no afecta la opción de recargar. La prueba de formularios verifica esta propiedad.

Los valores `comprado`, `activa`, `parcial` y otros estados son contratos guardados en Firebase; no se traducen modificando el catálogo. Si se añade otro idioma, crea un catálogo compatible y mapea etiquetas de estados sin cambiar sus valores persistidos. Actualmente se incluye español, sin selector de idioma en ejecución.

## Añadir o ajustar un campo

1. Modifica el schema correspondiente en `domain/schemas.ts`. Los tipos se infieren desde Zod.
2. Añade la etiqueta a `locales/es/fields.ts` y el descriptor a `config/recordFields.ts`.
3. Usa los tipos de campo disponibles: texto, dinero, cantidad, fecha, fecha/hora, teléfono o trabajador. Si necesitas otro control, amplía `FieldInput` y la conversión del editor.
4. Actualiza `firestore.rules` para que la validación del servidor corresponda a la del cliente.
5. Revisa los registros antiguos y respaldos: un nuevo campo obligatorio puede requerir un valor predeterminado o una migración explícita.
6. Añade pruebas de comportamiento y ejecuta las verificaciones.

El editor común controla los valores, las conversiones a centavos, los errores y los botones. `FieldInput` solo representa un control. Mantén las fórmulas financieras en el dominio para reutilizarlas en formularios, listas y resumen.

## Añadir una pantalla o componente

Crea una carpeta en `features/`, define sus props y recibe los datos y acciones necesarios. Registra su URL en `routes.ts`, su entrada de menú en `navigation.ts` y compón la pantalla desde `app/Workspace.tsx`, que selecciona la vista según la URL. No copies las suscripciones Firestore ni la lógica de autenticación en cada pantalla.

Antes de crear otro control, revisa `components/`: `StatCard` presenta una métrica, `PaymentBadge` calcula y representa el estado de pago, `RecordActions` concentra edición/eliminación y sus etiquetas accesibles, y `Brand` comparte la marca. Extrae componentes por una responsabilidad o reutilización real; evita envoltorios que solo añadan un nombre a un elemento HTML.

La autenticación usa `features/auth/useAuthForm.ts`. El cierre de sesión común está en `services/session.ts`; conserva el aviso de escrituras pendientes y cierra las sesiones de las apps Firebase de usuario.

## Estilos

`styles/index.css` importa las hojas en el orden de la cascada original. `tokens.css` contiene la base visual, `base.css` elementos generales, `workspace.css` paneles y disposición, `forms.css` el editor, `auth.css` el acceso y `responsive.css` las adaptaciones. `accessibility.css` conserva los ajustes finales de contraste. Cambiar ese orden puede alterar prioridades; la separación inicial mantuvo el CSS compilado equivalente.

## Verificar un cambio

```bash
docker compose exec -T app npm run lint
docker compose exec -T app npm run typecheck
docker compose exec -T app npm test
docker compose run --rm app npm run test:rules
docker compose run --rm -e VITE_EMULATOR_HOST=emulators app npm run test:e2e
docker compose exec -T app npm run build
```

Usa un contenedor independiente para Playwright si tienes un preview abierto en el puerto 4173. Al finalizar, el último build restaura la configuración local accesible desde el navegador del equipo. No ejecutes pruebas contra Firebase real ni uses la contraseña real en emuladores.

Revisa cambios de código, pruebas y documentación en el mismo commit cuando describan una misma modificación. No incluyas `.env`, datos locales, `dist`, resultados de pruebas ni archivos del IDE.
