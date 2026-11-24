# Reglas de Negocio y Lógica Financiera

Este documento compila las directrices matemáticas, restricciones contables y algoritmos de validación del **Dashboard de Finanzas Personales**.

---

## 1. Principio Financiero: Moneda Oficial Soles (S/.) y Aritmética en Céntimos Enteros

- **Moneda Oficial:** Soles Peruanos (`S/.` / `PEN`), con medios de pago locales (BCP, Interbank, BBVA, Yape, Plin y Efectivo).
- **Justificación Técnica:** Los números de punto flotante en JavaScript (IEEE 754) generan errores de precisión en sumas acumulativas.
- **Regla Estricta:** En el backend y en MongoDB Atlas, todos los saldos, límites y montos son **números enteros positivos que representan céntimos de Sol (centavos)**.
- **Conversiones:**
  - Entrada de datos: `montoEnCentavos = Math.round(parseFloat(valorDecimal) * 100)`
  - Salida visual: `formatearCentavosAMoneda(montoEnCentavos)` -> `"S/. 1,250.00"`
- **Validación:** `Number.isInteger(montoEnCentavos) && montoEnCentavos > 0`.

---

## 2. Reglas de Cuentas y Balances

1. **Tipos de Cuenta Válidos:** `efectivo`, `banco`, `tarjeta`, `billetera`.
2. **Cálculo de Saldo Actual:**
   $$\text{saldoActualEnCentavos} = \text{saldoInicialEnCentavos} + \sum \text{ingresos} - \sum \text{gastos}$$
3. **Registro de Movimiento:**
   - Si es `INGRESO`: $\text{saldoActualEnCentavos} \leftarrow \text{saldoActualEnCentavos} + \text{montoEnCentavos}$
   - Si es `GASTO`: $\text{saldoActualEnCentavos} \leftarrow \text{saldoActualEnCentavos} - \text{montoEnCentavos}$
4. **Regla Anti-Saldos Negativos (Validación de Saldo Insuficiente):**
   - **Alcance:** Aplica de forma estricta a cuentas de tipo `efectivo`, `banco` (débito/ahorros) y `billetera` (Yape/Plin). Solo las cuentas de tipo `tarjeta` (tarjetas de crédito) admiten saldo deudor/negativo.
   - **En Registro (POST):** Si el movimiento es de tipo `GASTO` y $\text{montoEnCentavos} > \text{saldoActualEnCentavos}$, la operación se cancela de forma atómica y se responde con código **400 Bad Request** con el mensaje explicativo: `"Saldo insuficiente en la cuenta '<nombre>'. Saldo disponible: S/. X.XX, monto solicitado: S/. Y.YY."`.
   - **En Modificación (PUT):** Se proyecta matemáticamente el saldo resultante tras revertir el movimiento anterior. Si el nuevo gasto provocaría un saldo negativo, se rechaza con **400 Bad Request** sin modificar ninguna cuenta en la base de datos.
   - **En Eliminación de Ingreso (DELETE):** Si eliminar un ingreso previo provocaría que el saldo vivo de la cuenta caiga por debajo de cero (debido a gastos posteriores ya ejecutados), se bloquea la eliminación con **400 Bad Request** informando al usuario que debe reordenar o reducir los gastos asociados antes de anular el ingreso.
   - **Validación Preventiva en Frontend:** El formulario `FormMovimiento.jsx` evalúa en tiempo real el saldo de la cuenta seleccionada frente al monto ingresado, mostrando una alerta contextual y bloqueando el envío si no existen fondos suficientes.
5. **Reversión en Modificación de Movimientos:**
   - Paso 1: Revertir el efecto financiero del monto y cuenta anteriores en memoria.
   - Paso 2: Validar la solvencia de la cuenta origen y destino.
   - Paso 3: Aplicar el nuevo efecto con el nuevo monto y cuenta.
   - Paso 4: Persistir de forma atómica.
6. **Reversión en Eliminación de Movimientos:**
   - Si el movimiento era `GASTO`: se devuelve el dinero a la cuenta sumando `montoEnCentavos`.
   - Si el movimiento era `INGRESO`: se resta `montoEnCentavos` de la cuenta tras verificar no saldo negativo.
7. **Integridad Referencial al Eliminar Cuentas:**
   - Si la cuenta tiene al menos un movimiento registrado, el sistema bloquea su borrado físico con código **409 Conflict** ("No se puede eliminar una cuenta con movimientos asociados") y sugiere desactivarla (`activo = false`).

---

## 3. Reglas de Categorías de Ingresos y Gastos

1. **Tipos Válidos:** `INGRESO`, `GASTO`.
2. **Coincidencia de Tipo:** Al registrar o editar un movimiento, el tipo del movimiento (`INGRESO` o `GASTO`) debe coincidir obligatoriamente con el tipo de la categoría asociada. Si difieren, se rechaza con **400 Bad Request**.
3. **Unicidad por Inquilino:** El nombre de la categoría es único por usuario e índice de tipo. Si el usuario intenta registrar un nombre repetido para el mismo tipo, se responde **409 Conflict**. Si otro usuario tiene el mismo nombre, se permite sin conflicto.

---

## 4. Reglas del Presupuesto Mensual y Semáforo de Cumplimiento

1. **Un Solo Presupuesto Global por Mes:** Cada usuario puede definir un único presupuesto por mes en formato `AAAA-MM` (ej. `2026-11`) para mantener la simplicidad (principio KISS).
2. **Cálculo del Gasto del Mes:** Suma de todos los movimientos de tipo `GASTO` del usuario cuya fecha pertenezca al mes consultado.
3. **Métricas de Avance:**
   - $\text{gastadoEnCentavos} = \sum \text{montoEnCentavos de gastos del mes}$
   - $\text{disponibleEnCentavos} = \text{montoLimiteEnCentavos} - \text{gastadoEnCentavos}$
   - $\text{porcentajeConsumido} = (\text{gastadoEnCentavos} / \text{montoLimiteEnCentavos}) \times 100$
4. **Semáforo Financiero:**
   - **`OK` (Verde):** $\text{porcentajeConsumido} < 80\%$
   - **`ALERTA` (Amarillo):** $80\% \le \text{porcentajeConsumido} \le 100\%$
   - **`EXCEDIDO` (Rojo):** $\text{porcentajeConsumido} > 100\%$
5. **Vinculación y Trazabilidad Presupuesto - Gastos - Categorías:**
   - **Navegación Contextual:** Al hacer clic en "Ajustar Presupuesto" desde el Dashboard, el parámetro `?mes=AAAA-MM` se transfiere a la vista de Presupuesto, preservando el período que el usuario está analizando.
   - **Desglose de Consumo por Categoría:** La pantalla de Presupuesto consume `/api/dashboard/por-categoria?mes=AAAA-MM` para renderizar el listado de categorías que explican exactamente de dónde proviene el monto gastado acumulado, mostrando el monto en Soles (S/.), el porcentaje sobre los gastos del mes y el porcentaje relativo al límite fijado.
   - **Auditoría Directa de Movimientos:** Dispone de un botón directo de navegación hacia `/movimientos?desde=AAAA-MM-01&hasta=AAAA-MM-31&tipo=GASTO`, permitiendo inspeccionar cada transacción unitaria que compone el gasto del presupuesto consultado.

---

## 5. Reglas de Validación con Validator.js y Day.js

1. **Correo Electrónico:** Validación con `validator.isEmail()`, normalización a minúsculas y eliminación de espacios en blanco con `validator.trim()`.
2. **Robustez de Contraseñas:** Longitud mínima de 8 caracteres, conteniendo al menos una letra y al menos un número.
3. **Filtros de Fechas con Day.js:** En consultas de movimientos, la fecha inicial (`desde`) debe ser cronológicamente anterior o igual a la fecha final (`hasta`). De lo contrario, se bloquea la consulta con advertencia visual.
4. **Límite de Intentos en Login:** Si se registran 5 intentos fallidos consecutivos de inicio de sesión para una cuenta, la cuenta se bloquea automáticamente por 15 minutos respondiendo con **429 Too Many Requests**.

---

## 6. Reglas de Exportación de Reportes

1. **Exportación a Excel (SheetJS):** Se ejecuta en el cliente exportando exactamente las filas filtradas con columnas `Fecha`, `Tipo`, `Categoría`, `Cuenta`, `Descripción` y `Monto (S/.)` con 2 decimales.
2. **Exportación a PDF (jsPDF + autotable):** Incluye título institucional, período consultado, tabla tabulada y resumen de totales (Ingresos, Gastos, Balance Neto).
3. **Control de Vacío:** Si el filtro no contiene transacciones, no se generan archivos vacíos y se emite una alerta con SweetAlert2 informando "No hay datos para exportar".
