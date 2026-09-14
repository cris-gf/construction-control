# Manual de usuario de Obra

**Para:** la persona que lleva el control de su construcción.

**Versión documentada:** 1.0.0, revisada el 14 de septiembre de 2026.

Obra organiza el presupuesto, las compras, los pendientes y los pagos de cada construcción. Cada cuenta tiene sus propias obras: no hay proyectos compartidos ni invitaciones en esta versión.

Para modificar el programa, consulta la [guía técnica](GUIA_TECNICA.md).

## Índice

1. [Acceso y primeros pasos](#1-acceso-y-primeros-pasos)
2. [Crear y seleccionar una obra](#2-crear-y-seleccionar-una-obra)
3. [Entender el resumen](#3-entender-el-resumen)
4. [Registrar y consultar compras](#4-registrar-y-consultar-compras)
5. [Comparar precios](#5-comparar-precios)
6. [Organizar pendientes y entregas](#6-organizar-pendientes-y-entregas)
7. [Trabajadores y pagos](#7-trabajadores-y-pagos)
8. [Trabajar sin conexión](#8-trabajar-sin-conexión)
9. [Exportar e importar respaldos](#9-exportar-e-importar-respaldos)
10. [Instalar en el teléfono y cerrar sesión](#10-instalar-en-el-teléfono-y-cerrar-sesión)
11. [Ejercicio completo](#11-ejercicio-completo)
12. [Solución de problemas y límites](#12-solución-de-problemas-y-límites)

## 1. Acceso y primeros pasos

### Abrir la aplicación

En el Mac donde está instalado el proyecto:

- [Abrir Obra / PWA local](http://localhost:5002).
- [Abrir la versión de desarrollo](http://localhost:5173), utilizada para revisar cambios de código.

Usa habitualmente una sola dirección. Cambiar de puerto, navegador o dispositivo puede requerir iniciar sesión nuevamente y volver a cargar los datos para uso sin conexión.

En el entorno local, Docker y los emuladores deben estar encendidos para registrar cuentas y sincronizar. El mensaje **ENTORNO LOCAL** significa que los datos se envían al emulador del Mac, no a un proyecto real en la nube.

Si tú administras el Mac y el sistema está apagado:

1. Abre Docker Desktop y espera a que inicie.
2. En una terminal ejecuta:

```bash
cd /Users/crisgf/projects/construction-control
docker compose up -d
```

Si todavía no se ha generado la versión de 5002, ejecuta `docker compose run --rm app npm run build`. La instalación inicial completa está en el [README](../README.md).

### Crear una cuenta

1. Pulsa **Crear una cuenta**.
2. Introduce tu correo y una contraseña de al menos ocho caracteres.
3. Marca **Este es un dispositivo de confianza. Activar acceso sin conexión.** solo en tu equipo personal.
4. Pulsa **Crear cuenta**.
5. Espera a que se abra tu espacio de trabajo.

La primera creación de cuenta y el primer inicio de sesión necesitan conexión con el servidor. En las pantallas de acceso puedes volver a **Iniciar sesión** si ya tienes cuenta.

La opción de confianza permite conservar información en el navegador. No la actives en una computadora prestada o compartida.

### Probar con datos de ejemplo

Si ya se cargó la demostración, entra con el correo y contraseña que configuraste en el archivo privado de entorno, o los que te entregue el administrador por un canal seguro. No hay una cuenta ni contraseña universal incluida en el código. Al entrar verás la obra **Casa del bosque**, con compras, un trabajador, un pago parcial y una compra pendiente.

La demostración pertenece únicamente a esa cuenta. Si ya tenías otra obra seleccionada, usa el selector de obras para abrir **Casa del bosque**. Puedes editar sus datos normalmente; repetir la carga no restablece los registros ni duplica la obra.

### Recuperar acceso

1. Pulsa **Olvidé mi contraseña**.
2. Introduce el correo de la cuenta.
3. Pulsa **Enviar recuperación** y sigue el enlace correspondiente.

En un despliegue con Firebase real el proceso utiliza correo electrónico. En el entorno local, el enlace aparece en los registros del emulador y no llega a tu bandeja; pide a quien administra el sistema que consulte `docker compose logs -f emulators`.

### Navegación

En el teléfono, las secciones están en la barra inferior. En escritorio, en la barra lateral.

| Sección | Para qué sirve |
| --- | --- |
| Resumen | Ver presupuesto, gastos, compromisos y agenda |
| Compras | Consultar compras, buscar, filtrar, editar y eliminar |
| Pendientes | Organizar compras futuras, actividades y entregas |
| Equipo | Administrar trabajadores y compromisos/pagos de mano de obra |
| Precios | Comparar compras anteriores del mismo material y unidad |
| Respaldo | Descargar datos, importar y modificar la obra |

En las pantallas de una obra verás tres acciones principales: **Registrar compra**, **Agregar pendiente** y **Registrar pago**.

## 2. Crear y seleccionar una obra

### Tu primera obra

1. Pulsa **Crear mi primera obra**.
2. Escribe el nombre, por ejemplo `Casa del bosque`.
3. Agrega descripción y ubicación si las necesitas.
4. Escribe el presupuesto en quetzales, por ejemplo `50000`.
5. Revisa la fecha de inicio y agrega finalización estimada si la conoces.
6. Selecciona planificación, activa, pausada o finalizada. Inicialmente aparece planificación.
7. Pulsa **Guardar obra**.

Introduce los montos sin `Q` ni separadores de miles: `50000` o `50000.50`. Usa punto para los decimales.

Para crear otra obra, usa **Nueva obra** en escritorio o el botón **+** junto al selector en móvil. Cambia de obra mediante el selector superior/lateral. Antes de registrar algo, comprueba el nombre seleccionado: todos los datos que agregues corresponden a esa obra.

### Modificar datos y presupuesto

Entra en **Respaldo → Editar obra y presupuesto**, realiza los cambios y guarda. Desde el resumen también puedes usar **Ver presupuesto**.

Cambiar el estado de la obra sirve para identificar su etapa; actualmente no bloquea la edición de registros.

### Eliminar una obra

En **Respaldo**, utiliza **Eliminar obra** y confirma. Descarga antes un respaldo si quieres conservar una copia accesible. La obra se oculta y no existe una papelera visible para restaurarla. Una importación de respaldo crea otra obra, no restaura la identidad de la eliminada.

## 3. Entender el resumen

| Dato | Significado |
| --- | --- |
| Presupuesto disponible | Presupuesto menos lo ya gastado y los compromisos pendientes |
| Total gastado | Abonos/pagos registrados en compras más pagos realizados de mano de obra |
| Por pagar y comprar | Saldos de compras, saldos de mano de obra y estimaciones de pendientes que todavía cuentan como compromiso |
| Materiales y servicios | Dinero efectivamente pagado en compras |
| Mano de obra | Dinero efectivamente pagado al equipo |
| Porcentaje utilizado | Total gastado dividido entre presupuesto; no incluye compromisos |

**Disponible no significa únicamente dinero no pagado:** ya descuenta lo que has comprometido. Por eso pagar una deuda ya registrada normalmente cambia la distribución entre gasto y compromiso, pero no el disponible.

La aplicación avisa al alcanzar 80 %, 90 % o 100 % de gasto respecto al presupuesto. Si el presupuesto es cero, indica que debes configurarlo en lugar de mostrar un porcentaje. Un disponible negativo indica que gastos más compromisos superan el presupuesto.

### Agenda

- **Vencidas:** su fecha y hora límite ya pasaron.
- **Para hoy:** vencen hoy y todavía no pasó la hora límite.
- **Próximas:** tienen límite en un día posterior.

Los pendientes recibidos, completados o cancelados no se incluyen en esos contadores. Los que no tienen fecha límite siguen en la lista, pero no entran en esas tres categorías. Las fechas se manejan en horario de Guatemala.

## 4. Registrar y consultar compras

### Una compra nueva

1. Pulsa **Registrar compra**.
2. Revisa **Fecha y hora**.
3. Escribe **Material o servicio** y, si lo deseas, **Categoría**.
4. Indica **Cantidad**, **Unidad** y **Precio unitario (Q)**.
5. Agrega **Proveedor**.
6. Revisa el total calculado.
7. Escribe cuánto has pagado hasta ahora en **Monto pagado (Q)**.
8. Completa forma de pago, factura/referencia y notas si corresponde.
9. Pulsa **Guardar compra**.

Ejemplo:

| Campo | Introducir |
| --- | --- |
| Material o servicio | Cemento UGC |
| Cantidad | `35` |
| Unidad | saco |
| Precio unitario (Q) | `71.99` |
| Monto pagado (Q) | `1000` |

El total debe ser **Q2,519.65** y el saldo **Q1,519.65**.

La cantidad admite hasta tres decimales, como `1.250`. El precio y el pago admiten hasta dos. No introduzcas cantidades o importes negativos.

### Pagado, parcial o pendiente

No tienes que elegir manualmente el estado de pago:

- Pago cero sobre una compra con total mayor que cero: pendiente.
- Pago mayor que cero e inferior al total: parcial.
- Pago igual al total: pagado.

El botón **Marcar pagado** completa el monto pagado con el total actual. Aún debes pulsar **Guardar compra**. No admite un abono mayor que el total.

### Registrar un segundo abono

1. Abre **Compras** y localiza el registro.
2. Pulsa el icono de lápiz.
3. Actualiza **Monto pagado (Q)** con el **acumulado**, no solo con el nuevo abono.
4. Guarda y comprueba el saldo.

Si ya pagaste Q1,000.00 y entregas otros Q500.00, escribe `1500`. No crees una segunda compra por el mismo material para representar ese abono: duplicaría el total comprado.

Esta versión no conserva una lista individual de todos los abonos de un mismo registro. Puedes usar las notas para describirlos; al editar, los campos de fecha/referencia del registro se actualizan según lo que introduzcas.

### Buscar, filtrar y corregir

En **Compras** puedes buscar por material o proveedor y combinar filtros de proveedor, categoría, estado de pago y fechas desde/hasta. Para volver a ver todo, borra la búsqueda y restaura los filtros a sus opciones generales.

El lápiz permite revisar también notas, factura y demás detalles, además de corregirlos. La papelera solicita confirmación y retira la compra de los totales. No hay botón visible de deshacer.

## 5. Comparar precios

1. Entra en **Precios**.
2. Selecciona el material y después la unidad.
3. Revisa **Menor precio**, **Más reciente** y la lista de compras anteriores.
4. Si hay dos compras compatibles, selecciona **Compra A** y **Compra B**.
5. Introduce la **Cantidad a comprar** para estimar el ahorro.

Por ejemplo, A a Q74.50 y B a Q71.99 por saco tienen una diferencia de Q2.51 por saco, aproximadamente 3.37 % respecto de A. Para 35 sacos, el ahorro estimado es Q87.85.

El cálculo compara precios registrados; no solicita cotizaciones actuales. Comprueba que sean productos equivalentes, incluyendo marca y presentación cuando importe.

Usa siempre el mismo nombre y unidad: `saco` y `sacos`, o `Cemento UGC` y `Cemento`, pueden dificultar la selección de registros comparables. No se convierten sacos a libras ni metros a unidades. Si falta información, aparecerá el aviso de que se necesitan al menos dos compras del mismo material y unidad.

## 6. Organizar pendientes y entregas

### Agregar un pendiente

1. Pulsa **Agregar pendiente**.
2. Selecciona tipo: comprar, recibir, solicitar, pagar u otro.
3. Escribe el material o la actividad.
4. Revisa cantidad, unidad, precio estimado y proveedor.
5. Completa las fechas que necesites.
6. Elige prioridad y estado.
7. Agrega notas y pulsa **Guardar pendiente**.

Los valores iniciales incluyen cantidad `1`, precio `0`, prioridad **baja** y estado **solicitado**. Revísalos antes de guardar. Para una actividad sin cantidad física puedes dejar `1` y precio `0`; no borres la cantidad, porque la validación espera un número.

| Fecha | Uso |
| --- | --- |
| Fecha límite | Determina vencimiento y contadores de la agenda |
| Compra prevista | Permite generar el evento de compra |
| Recepción prevista | Permite generar el evento de recepción |

La fecha de recepción no sustituye automáticamente a la fecha límite. Si quieres que una entrega aparezca vencida al pasar esa hora, completa también el límite.

### Cambiar estado

En la tarjeta del pendiente hay un selector de estado. Elegir una opción guarda el cambio; observa el indicador de sincronización.

| Estado | ¿Su estimación cuenta como compromiso si no tiene compra vinculada? |
| --- | --- |
| Solicitado | Sí |
| Pendiente de compra | Sí |
| Comprado | No |
| En camino | No |
| Recibido | No |
| Completado | No |
| Cancelado | No |

Si ya existe una compra vinculada, se usa el saldo de esa compra y no la estimación del pendiente, independientemente del estado que elijas después.

**Cambiar a comprado no crea una compra.** Para que el gasto y la deuda queden registrados, utiliza la conversión descrita a continuación. Del mismo modo, cancelar un pendiente vinculado no elimina ni cancela su compra: revisa ambos registros.

### Convertir un pendiente en compra

1. En **Pendientes**, pulsa **Convertir en compra** en la tarjeta correspondiente.
2. Revisa los datos que ya se copiaron.
3. Corrige el precio real, la fecha y cualquier dato faltante.
4. Registra cuánto pagaste; no se supone que esté pagado automáticamente.
5. Pulsa **Guardar compra**.

La aplicación enlaza ambos registros y deja de sumar la estimación. No registres además otra compra manual por la misma operación.

La acción no aparece si ya hay compra vinculada o si el pendiente está cancelado/completado. Si eliminas posteriormente la compra vinculada, su estimación anterior no se recupera sola; revisa cómo representar el nuevo compromiso antes de volver a comprar.

### Agregar eventos al calendario

1. Guarda una **Compra prevista**, una **Recepción prevista** o ambas.
2. En la tarjeta aparecerán botones de calendario **Compra** y/o **Recepción**.
3. Pulsa el evento que necesitas; se descarga un archivo `.ics`.
4. Ábrelo desde Descargas o desde la aplicación de calendario compatible y confirma la incorporación.

Se genera un archivo distinto para compra y recepción, con duración de una hora y solicitud de aviso 30 minutos antes. El calendario del teléfono controla si se muestra la alerta y con qué permisos.

Los eventos son copias: modificar el pendiente no actualiza automáticamente el calendario. Si cambias la fecha, corrige o sustituye también el evento del calendario para evitar recordatorios antiguos o duplicados. Obra no envía notificaciones programadas desde un servidor.

## 7. Trabajadores y pagos

### Crear un trabajador

1. Entra en **Equipo**.
2. Pulsa **Trabajador**.
3. Completa nombre, oficio y teléfono opcional.
4. Selecciona acuerdo diario, semanal, por actividad u otro.
5. Agrega tarifa habitual si quieres tenerla como referencia.
6. Revisa el estado activo/inactivo y guarda.

Crear un trabajador no genera automáticamente deuda. Su tarifa habitual tampoco completa por sí sola los importes de los pagos: debes registrar el compromiso correspondiente.

### Registrar un compromiso y un abono

1. Pulsa **Registrar pago**.
2. Selecciona el trabajador.
3. Indica período/semana y trabajo realizado.
4. Escribe **Monto acordado (Q)**.
5. Escribe el **Monto pagado (Q)** acumulado; usa `0` si todavía no has pagado.
6. Revisa fecha, forma de pago, referencia y notas.
7. Pulsa **Guardar pago de mano de obra**.

Ejemplo: acordado `2000`, pagado `500` → saldo **Q1,500.00**, estado parcial.

Para abonar otros Q300.00 al mismo compromiso, edita ese registro y cambia pagado a `800`. Para otra semana o actividad con un nuevo monto acordado, crea un registro separado. Registrar de nuevo los mismos Q2,000.00 para un segundo abono duplicaría el compromiso.

### Consultar historial

En **Equipo → Compromisos y pagos**, selecciona un trabajador o **Todo el equipo**. Verás los registros y sus totales acordado, pagado y pendiente. Puedes editar con el lápiz o eliminar con la papelera y confirmación.

Si el trabajador deja la obra, edita su ficha y márcalo inactivo. El historial se conserva. El estado inactivo es informativo; actualmente no impide seleccionarlo en un pago. No se permite eliminar desde la interfaz un trabajador que tenga pagos no eliminados.

## 8. Trabajar sin conexión

### Antes de salir al terreno

1. En tu teléfono personal, entra a la dirección HTTPS de la aplicación instalada/configurada.
2. Inicia sesión marcando dispositivo de confianza.
3. Abre la obra y espera a que carguen sus datos y desaparezca el aviso de cambios pendientes.
4. Recorre las secciones que utilizarás.
5. Mantén la sesión abierta y usa el mismo navegador o instalación.

La primera carga y autenticación requieren conexión. Sin conexión puedes consultar datos previamente cargados y crear/editar registros. No aparecerán datos de otras obras que nunca se hayan cargado en ese dispositivo.

En la demostración local el servidor es tu Mac: para sincronizar tienes que poder comunicarte con sus emuladores. Una instalación real con Firebase permite sincronizar por Internet con el proyecto configurado.

### Interpretar los mensajes

| Mensaje | Qué hacer |
| --- | --- |
| Conectado | Las consultas activas tienen comunicación con el servidor; revisa también si hay cambios pendientes |
| Sin conexión | Sigue trabajando con los datos disponibles; los cambios esperan envío |
| Sincronizando / Cambios pendientes | Espera confirmación antes de considerar que están respaldados en el servidor |
| Conectando | Todavía se está resolviendo la conexión o la carga desde caché |
| Con error | Lee el aviso y usa Reintentar; si informa un conflicto, revisa la versión reciente |
| Cambio enviado a la cola local; pendiente de confirmación | El cambio se envió al almacenamiento/cola local, todavía no se confirmó en el servidor |
| Cambios confirmados en el servidor | El servidor aceptó esa escritura; en entorno local se refiere al emulador |

Al recuperar conexión, abre la aplicación y espera a que termine de sincronizar. No se garantiza que sincronice con el navegador cerrado. No borres los datos del sitio ni reinstales la aplicación mientras haya cambios pendientes.

### Si otra edición cambió el registro

Si aparece **Este registro cambió**, anota tu corrección antes de recargar. Utiliza **Recargar versión reciente** cuando esté disponible; si el error ocurrió después de reconectar, vuelve a abrir el registro. Compara la información actual y aplica de nuevo solo el ajuste necesario.

Un formulario abierto no combina automáticamente su contenido con una edición realizada en otra pestaña o dispositivo.

## 9. Exportar e importar respaldos

### Descargar

1. Selecciona la obra correcta.
2. Entra en **Respaldo** y espera a que los botones estén habilitados.
3. Elige CSV de compras, pagos de mano de obra o pendientes, o **Respaldo completo JSON**.
4. Guarda el archivo con un nombre identificable, por ejemplo `casa-bosque-2026-09-14.json`.

| Archivo | Cuándo usarlo |
| --- | --- |
| CSV | Revisar una lista en una hoja de cálculo; solo incluye registros no eliminados |
| JSON | Conservar o trasladar una obra completa; es el formato que puede importar Obra |

El CSV mantiene nombres técnicos de columnas. Los campos terminados en `Cents` están en centavos: `7199` significa Q71.99 y `100000` significa Q1,000.00. Los saldos y totales calculados que ves en pantalla no se agregan como columnas automáticamente. En pagos, `workerId` identifica al trabajador; el JSON completo incluye también las fichas de trabajadores.

Cada exportación corresponde a una sola obra. Repite el proceso por cada obra. Los archivos no contienen contraseñas, pero sí información de la construcción: guárdalos donde puedas recuperarlos sin exponerlos a otras personas.

Para una copia confirmada, espera primero a sincronizar. Una exportación hecha offline puede incluir cambios locales aún pendientes de aceptación. El JSON conserva registros marcados como eliminados, que seguirán ocultos al importarlo.

### Importar JSON

1. Inicia sesión en la cuenta que recibirá los datos.
2. Abre una obra y entra en **Respaldo**. Si la cuenta está vacía, crea primero una obra para poder acceder a esa pantalla.
3. En **Importar respaldo**, selecciona el archivo JSON de Obra.
4. Revisa la vista previa: nombre, presupuesto y cantidades de registros.
5. Pulsa **Confirmar importación en una obra nueva**.
6. Espera **Respaldo importado y confirmado** y comprueba la obra seleccionada.

La nueva obra lleva el nombre original más **(importada)**. No reemplaza ni fusiona datos con la obra desde la que iniciaste la importación. Si importas el mismo archivo dos veces, crearás dos obras independientes.

El archivo debe tener formato válido, hasta 10 MB y un máximo de 450 registros de subcolecciones para importación. Se incluyen en ese conteo los registros eliminados que conserva el respaldo. Si supera el límite, no intentes borrar manualmente partes del JSON: podrías romper las relaciones; pide ayuda técnica.

La importación no conserva la identidad de otra cuenta. Todo lo importado se asigna a la cuenta con la que has iniciado sesión. No se importan archivos CSV en esta versión.

## 10. Instalar en el teléfono y cerrar sesión

### Instalar

Abre la dirección HTTPS proporcionada por quien administra la aplicación, con conexión. Busca la opción del navegador para instalar/agregar la aplicación a inicio; en iPhone, la interfaz indica **Compartir → Agregar a inicio**. El nombre exacto y la disponibilidad pueden variar por navegador.

`localhost` en tu teléfono se refiere al propio teléfono, no al Mac. La dirección `http://localhost:5002` de este manual es para el Mac. El acceso offline de una PWA necesita un contexto seguro; no basta abrir la IP del Mac por HTTP. Si aún utilizas solo la demostración local, solicita la configuración HTTPS antes de depender del teléfono en el terreno.

Instalar el icono no sustituye cargar tus datos y activar dispositivo de confianza.

### Cerrar sesión

En escritorio, usa **Cerrar sesión** en la barra lateral. En móvil, entra en **Respaldo** y busca **Cerrar sesión**.

Si hay cambios pendientes, se solicita confirmación. Es preferible sincronizarlos antes de salir; si eliges conservarlos, vuelve después a la misma cuenta, navegador y origen para continuar.

Al cerrar sesión desaparece la información privada de la interfaz. Los datos persistidos siguen en ese navegador de confianza; cerrar sesión no es un borrado completo del dispositivo.

## 11. Ejercicio completo

Usa una obra de práctica, sin mezclar estos ejemplos con registros reales.

1. Crea `Práctica de control` con presupuesto `50000`.
2. Registra 35 sacos de cemento a `71.99`, con pago acumulado `1000`.
3. Crea un trabajador y un compromiso de `2000`, con pago acumulado `500`.
4. Agrega un pendiente de 10 unidades de varilla a `50` cada una; déjalo solicitado o pendiente de compra, sin compra vinculada.
5. Abre **Resumen** y comprueba:

| Concepto | Resultado |
| --- | --- |
| Presupuesto | Q50,000.00 |
| Pagado en compras | Q1,000.00 |
| Pagado en mano de obra | Q500.00 |
| Total gastado | Q1,500.00 |
| Saldo de compra | Q1,519.65 |
| Saldo de mano de obra | Q1,500.00 |
| Estimación de varilla | Q500.00 |
| Por pagar y comprar | Q3,519.65 |
| Disponible | Q44,980.35 |
| Porcentaje utilizado | 3.0 % |

6. Convierte el pendiente de varilla en compra manteniendo precio `50`, cantidad `10` y pagado `0`. El compromiso total debe seguir en **Q3,519.65**: la compra sustituye a la estimación.
7. Exporta un JSON desde **Respaldo**. Si lo importas como práctica, se creará otra obra y no cambiará la original.

## 12. Solución de problemas y límites

| Problema | Revisión sugerida |
| --- | --- |
| No abre la dirección local | Comprueba Docker y que app/emuladores estén encendidos en el Mac |
| No veo mis registros | Revisa correo de la sesión, obra seleccionada y filtros; confirma que no estás usando otra dirección/navegador sin datos cargados |
| El monto no se acepta | Usa `71.99`, sin `Q`, comas ni signos negativos; el abono no puede exceder el total |
| El total pagado parece duplicado | Revisa si creaste otra compra o compromiso para registrar un abono; los pagos del mismo registro son acumulados |
| No aparece un trabajador al registrar pago | Crea antes su ficha en Equipo y verifica que sea la misma obra |
| No aparece el botón de calendario | Guarda primero la fecha de compra o recepción correspondiente |
| El calendario muestra una fecha antigua | El evento descargado no se actualiza con Obra; corrígelo o reemplázalo en el calendario |
| No puedo eliminar un trabajador | Tiene pagos no eliminados; puedes marcarlo inactivo |
| No funciona offline después de cambiar de navegador | Cada navegador/origen necesita sesión, confianza y carga previa |
| El JSON no se importa | Revisa que sea un respaldo JSON de Obra, su tamaño y número de registros; no uses un CSV |
| Los botones de respaldo están deshabilitados | Espera a que terminen de cargar los registros de la obra y revisa la conexión |

No hay colaboración entre cuentas, adjuntos/fotos de facturas, conversión de unidades, historial separado de cada abono, restauración desde una papelera ni sincronización automática de eventos de calendario. Estas limitaciones también se detallan en [DECISIONS.md](../DECISIONS.md).

Una rutina práctica es registrar compras y abonos al realizarlos, revisar pendientes al comenzar el día, confirmar sincronización al recuperar señal y descargar un JSON antes de cambios importantes o al cerrar una etapa de la obra.
