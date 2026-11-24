# Especificación de Historias de Usuario (HU) y Criterios de Aceptación (BDD / Gherkin)

Este documento define las 10 Historias de Usuario oficiales del **Dashboard de Finanzas Personales**, diseñadas bajo el marco **INVEST** y la sintaxis concisa de una sola línea en **Gherkin** (`Dado que · Cuando · Entonces`), cubriendo los escenarios de prueba por historia (Camino Feliz, Flujo Alternativo, Manejo de Errores, Caso de Borde y Reglas Financieras).

---

## Matriz de Cobertura y Códigos HTTP Estandarizados
- **400 Bad Request:** Datos de entrada inválidos o faltantes.
- **401 Unauthorized:** Token ausente, inválido o credenciales erróneas.
- **403 Forbidden:** Intento de acceso sin permisos por rol (RBAC).
- **404 Not Found:** Recurso inexistente o perteneciente a otro inquilino (aislamiento IDOR).
- **409 Conflict:** Recurso duplicado o en uso (ej. cuenta con movimientos asociados).
- **429 Too Many Requests:** Bloqueo temporal por superar el límite de intentos de login.
- **500 Internal Server Error:** Error interno no controlado en el servidor.

---

## HU-01: Registro e Inicio de Sesión
- **Rol:** Como visitante.
- **Funcionalidad:** Quiero crear una cuenta e iniciar sesión.
- **Razón / Resultado:** Para acceder a mis finanzas de forma privada.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que no tengo cuenta · Cuando envío nombre, email válido y contraseña de 8+ caracteres con letra y número · Entonces se crea mi usuario con rol USUARIO, recibo un JWT (1h) y soy redirigido al dashboard.
- **E2 Alternativo:** Dado que ya tengo cuenta activa · Cuando inicio sesión con credenciales correctas · Entonces el sistema autentica, emite el token JWT y veo mi dashboard con mi nombre en la barra superior.
- **E3 Error:** Dado que ingreso una contraseña incorrecta · Cuando envío el login · Entonces el sistema responde 401 y muestra "Credenciales inválidas" sin indicar cuál dato falló.
- **E4 Borde:** Dado que el email ya está registrado (incluso con distinta capitalización o espacios) · Cuando intento registrarme · Entonces el validador normaliza y responde 409 "El correo ya está registrado".

---

## HU-02: Recuperación de Contraseña
- **Rol:** Como usuario registrado.
- **Funcionalidad:** Quiero restablecer mi contraseña por correo.
- **Razón / Resultado:** Para recuperar el acceso a mis finanzas si la olvido.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que mi email existe en el sistema · Cuando solicito recuperación · Entonces recibo un correo con un enlace y token de un solo uso que expira en 30 minutos.
- **E2 Alternativo:** Dado que abro un enlace válido dentro de los 30 minutos · Cuando ingreso una contraseña nueva válida de 8+ caracteres · Entonces se actualiza el hash de la clave, se invalida el token y puedo iniciar sesión con ella.
- **E3 Error:** Dado que el enlace expiró o ya fue utilizado · Cuando intento restablecer la contraseña · Entonces el sistema responde 400 "Enlace inválido o expirado".
- **E4 Borde:** Dado que el email ingresado no existe en la base de datos · Cuando solicito recuperación · Entonces el sistema muestra el mismo mensaje genérico de éxito y no envía ningún correo (mitigación de enumeración).

---

## HU-03: Cuentas o Medios de Pago
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero registrar mis cuentas y medios de pago.
- **Razón / Resultado:** Para saber de dónde sale y a dónde entra mi dinero.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que estoy en la sección Cuentas · Cuando creo "Banco Principal BCP" de tipo banco con saldo inicial 1000 (S/. 10.00 / 1000 céntimos) · Entonces la cuenta se crea asociada a mi usuarioId y aparece en mi lista con su saldo actual.
- **E2 Alternativo:** Dado que tengo una cuenta registrada · Cuando edito su nombre · Entonces el cambio se refleja de inmediato en los selectores y en los movimientos asociados.
- **E3 Error:** Dado que dejo el nombre de la cuenta vacío o con saldo inválido · Cuando intento guardar · Entonces responde 400 y marca el campo con el mensaje descriptivo de validación.
- **E4 Borde:** Dado que la cuenta posee movimientos financieros registrados · Cuando intento eliminarla · Entonces el sistema lo impide con 409 "No se puede eliminar una cuenta con movimientos asociados" y sugiere desactivarla lógicamente.

---

## HU-04: Categorías de Ingresos y Gastos
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero administrar categorías personalizadas.
- **Razón / Resultado:** Para clasificar mis movimientos según mis necesidades particulares.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que estoy en la vista de Categorías · Cuando creo "Alimentación" de tipo GASTO con un color seleccionado · Entonces queda guardada vinculada a mi usuarioId y disponible para clasificar gastos.
- **E2 Alternativo:** Dado que ya existe una categoría · Cuando modifico su color identificador · Entonces los gráficos del dashboard utilizan de inmediato el nuevo color sin recargar.
- **E3 Error:** Dado que ya existe "Alimentación" de tipo GASTO en mis categorías · Cuando intento crear otra con el mismo nombre y tipo · Entonces responde 409 "La categoría ya existe".
- **E4 Borde:** Dado que otro usuario tiene registrada una categoría con el mismo nombre · Cuando yo creo la mía · Entonces el sistema lo permite sin conflictos, porque la unicidad del índice es compuesta por `(usuarioId, nombre, tipo)`.

---

## HU-05: Registrar Ingresos y Gastos
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero registrar movimientos financieros.
- **Razón / Resultado:** Para llevar el control de mi dinero en tiempo real.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que tengo una cuenta y una categoría creadas · Cuando registro un gasto de 45.50 (4550 centavos) con fecha de hoy · Entonces se guarda, el saldo de la cuenta disminuye automáticamente en 4550 centavos y recibo un toast de éxito.
- **E2 Alternativo:** Dado que registré un movimiento · Cuando lo edito o elimino y confirmo en el diálogo de SweetAlert2 · Entonces el sistema se actualiza o elimina y los saldos de las cuentas se recalculan de forma exacta mediante reversión matemática.
- **E3 Error:** Dado que ingreso un monto igual a 0, negativo o con texto no numérico · Cuando presiono guardar · Entonces responde 400 "El monto debe ser un número entero mayor a 0".
- **E4 Borde:** Dado que la categoría seleccionada es de tipo INGRESO · Cuando intento registrarla en un movimiento de tipo GASTO · Entonces el sistema rechaza la transacción con código 400 por incompatibilidad de tipo.
- **E5 Regla Anti-Saldos Negativos:** Dado que una cuenta de tipo efectivo, banco o billetera digital posee un saldo disponible · Cuando intento registrar o editar un gasto superior a dicho saldo · Entonces el sistema rechaza la operación con código 400 Bad Request ("Saldo insuficiente en la cuenta...") y la interfaz previene el envío, garantizando que el saldo de cuentas no crediticias nunca sea negativo.

---

## HU-06: Historial y Filtros Dinámicos
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero consultar y filtrar mis movimientos.
- **Razón / Resultado:** Para revisar mis hábitos de consumo en períodos específicos.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que tengo transacciones registradas · Cuando abro la vista de Movimientos · Entonces veo una lista paginada ordenada cronológicamente del más reciente al más antiguo.
- **E2 Alternativo:** Dado que estoy en el historial · Cuando aplico filtros por rango de fechas (desde/hasta), categoría, cuenta y tipo · Entonces la tabla se actualiza reactivamente mostrando solo los registros que cumplen todos los criterios.
- **E3 Error:** Dado que la fecha inicial ingresada es posterior a la fecha final · Cuando aplico el filtro · Entonces Day.js detecta el error y la interfaz muestra "La fecha inicial no puede ser mayor a la fecha final" sin enviar la petición.
- **E4 Borde:** Dado que ningún movimiento coincide con los filtros aplicados · Cuando se ejecuta la búsqueda · Entonces el sistema muestra una vista de EstadoVacio con el mensaje "No hay movimientos para los filtros seleccionados".

---

## HU-07: Presupuesto Mensual y Avance
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero definir un presupuesto mensual global y ver su avance.
- **Razón / Resultado:** Para controlar que mis gastos no excedan el límite planificado.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que defino un presupuesto de 2000 (S/. 2,000.00 / 200000 céntimos) para el mes actual (AAAA-MM) · Cuando registro gastos acumulados por 500 (50000 céntimos) · Entonces la consulta devuelve 25 % consumido, 1500 disponible y estado "OK".
- **E2 Alternativo:** Dado que ya tengo un presupuesto fijado para el mes · Cuando modifico su monto límite · Entonces el avance y disponible se recalculan de forma inmediata en base al nuevo límite.
- **E3 Error:** Dado que ingreso un límite negativo, igual a cero o vacío · Cuando intento guardar · Entonces el validador responde con código 400.
- **E4 Borde:** Dado que el gasto acumulado del mes supera el 80 % del límite presupuestado · Cuando abro el dashboard · Entonces veo una alerta visual amarilla, y si supera el 100 %, cambia a alerta crítica roja con estado "EXCEDIDO".
- **E5 Trazabilidad y Desglose por Categoría:** Dado que consulto el presupuesto de un mes con transacciones · Cuando reviso el panel · Entonces visualizo el desglose de categorías que consumen el presupuesto con su proporción en Soles y porcentaje, junto con un acceso directo para auditar dichos gastos en el Historial de Movimientos.

---

## HU-08: Dashboard e Indicadores Gráficos
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero visualizar indicadores y gráficos interactivos.
- **Razón / Resultado:** Para entender mi situación financiera general de un vistazo.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que tengo movimientos en el mes · Cuando abro el Dashboard · Entonces veo las tarjetas KPI (ingresos, gastos, balance neto), gráfico de barras de ingresos vs gastos, dona por categoría y línea de tendencia semestral.
- **E2 Alternativo:** Dado que estoy en el dashboard · Cuando cambio el selector de mes · Entonces todos los KPIs y gráficos se actualizan de manera asíncrona mediante `useEffect` sin recargar la página.
- **E3 Error:** Dado que la conexión con el servidor o MongoDB Atlas falla · Cuando se solicitan los datos del dashboard · Entonces la interfaz captura el error y despliega un contenedor informativo con el botón "Reintentar".
- **E4 Borde:** Dado que soy un usuario nuevo sin movimientos registrados · Cuando abro el dashboard · Entonces todos los KPIs muestran 0 y se presenta un estado vacío amigable invitándome a registrar mi primer movimiento.

---

## HU-09: Exportación de Reportes en Excel y PDF
- **Rol:** Como usuario autenticado.
- **Funcionalidad:** Quiero exportar mis movimientos a archivos Excel y PDF.
- **Razón / Resultado:** Para archivarlos o compartirlos formalmente.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que apliqué filtros a mis movimientos en pantalla · Cuando presiono "Exportar Excel" · Entonces SheetJS genera en el cliente y descarga un archivo `.xlsx` estructurado con exactamente esos registros y montos decimales.
- **E2 Alternativo:** Dado que estoy en el historial de transacciones · Cuando presiono "Exportar PDF" · Entonces jsPDF y autotable generan y descargan un PDF ejecutivo con título, período, tabla formateada y totales de ingresos, gastos y balance.
- **E3 Error:** Dado que ocurre un error inesperado al procesar los datos de exportación · Cuando intento exportar · Entonces el sistema captura la excepción, emite una notificación Toast de error y la pantalla se mantiene 100% funcional.
- **E4 Borde:** Dado que la tabla no contiene ningún movimiento con los filtros activos · Cuando presiono cualquiera de los botones de exportación · Entonces SweetAlert2 muestra la alerta "No hay datos para exportar" y no genera ningún archivo en blanco.

---

## HU-10: Control de Acceso (RBAC) y Aislamiento de Datos
- **Rol:** Como administrador y como usuario regular.
- **Funcionalidad:** Quiero que cada rol acceda exclusivamente a los recursos que le corresponden.
- **Razón / Resultado:** Para proteger la confidencialidad y la privacidad de la información financiera.

### Criterios de Aceptación (Sintaxis Gherkin)
- **E1 Camino feliz:** Dado que he iniciado sesión con rol ADMIN · Cuando abro el panel `/admin/usuarios` · Entonces puedo listar todos los usuarios del sistema, modificar sus roles (ADMIN/USUARIO) y activar o desactivar sus cuentas.
- **E2 Alternativo:** Dado que he iniciado sesión con rol USUARIO · Cuando navego por mi aplicación · Entonces accedo solo a mis propios datos y la opción del panel de administración no es visible ni accesible.
- **E3 Error:** Dado que un usuario con rol USUARIO intenta invocar directamente el endpoint `GET /api/admin/usuarios` · Cuando la petición llega al servidor · Entonces el middleware `autorizar('ADMIN')` intercepta y responde HTTP 403 "No tienes permisos".
- **E4 Borde:** Dado que un usuario malicioso intenta consultar o modificar un movimiento ajeno conociendo su ID (`GET /api/movimientos/:id`) · Cuando el repositorio ejecuta la consulta · Entonces el `RepositorioBase` filtra con `{ _id: id, usuarioId }`, no encuentra coincidencia y responde HTTP 404 sin revelar la existencia del registro ajeno.
