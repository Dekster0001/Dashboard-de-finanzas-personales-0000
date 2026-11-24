# Especificación de la API REST - Dashboard de Finanzas Personales

Este documento define el catálogo oficial de rutas, métodos HTTP, parámetros y contratos JSON para el backend del **Dashboard de Finanzas Personales**.

---

## 1. Convenciones Globales

- **Prefijo Global de Endpoints:** `/api`
- **Formato:** `application/json; charset=utf-8`
- **Autenticación:** Cabecera HTTP `Authorization: Bearer <token_jwt>` (duración de 1 hora mediante `passport-jwt`).
- **Manejo Financiero:** Todos los montos se transmiten y operan en Soles Peruanos (`S/.`) como **números enteros en céntimos** (ej. S/. 15.50 = `1550` céntimos).
- **Aislamiento Multiinquilino:** El `usuarioId` se extrae inmutablemente del token verificado en el middleware y se inyecta en cada consulta a través de `RepositorioBase`.

### Estructura Uniforme de Respuestas

#### Respuesta Exitosa (200 OK / 201 Created)
```json
{
  "estado": "exito",
  "mensaje": "Operación ejecutada satisfactoriamente",
  "datos": { ... }
}
```

#### Respuesta de Error (400, 401, 403, 404, 409, 429, 500)
```json
{
  "estado": "fallo",
  "mensaje": "Descripción clara del error",
  "errores": [
    {
      "campo": "correo",
      "mensaje": "Debe ingresar una dirección de correo electrónico válida."
    }
  ]
}
```

---

## 2. Catálogo de Endpoints

### 2.1 Módulo de Autenticación (`/api/auth`)

#### Registrar Usuario
- **POST** `/api/auth/registro`
- **Acceso:** Público
- **Cuerpo:**
  ```json
  {
    "nombre": "Carlos Mendoza",
    "correo": "carlos@correo.com",
    "contrasena": "Finanzas2026!"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Usuario registrado exitosamente. Ya puede iniciar sesión.",
    "datos": {
      "uuid": "u-482a-912f-6831d15ab901",
      "nombre": "Carlos Mendoza",
      "correo": "carlos@correo.com",
      "rol": "USUARIO"
    }
  }
  ```

#### Iniciar Sesión (Login)
- **POST** `/api/auth/login`
- **Acceso:** Público (bloqueo tras 5 intentos fallidos)
- **Cuerpo:**
  ```json
  {
    "correo": "carlos@correo.com",
    "contrasena": "Finanzas2026!"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Inicio de sesión exitoso",
    "datos": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "usuario": {
        "uuid": "u-482a-912f-6831d15ab901",
        "nombre": "Carlos Mendoza",
        "correo": "carlos@correo.com",
        "rol": "USUARIO"
      }
    }
  }
  ```

#### Olvidé Contraseña
- **POST** `/api/auth/olvide-contrasena`
- **Acceso:** Público
- **Cuerpo:**
  ```json
  {
    "correo": "carlos@correo.com"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Si el correo electrónico coincide con una cuenta activa, recibirá las instrucciones de recuperación en breve."
  }
  ```

#### Restablecer Contraseña
- **POST** `/api/auth/restablecer-contrasena`
- **Acceso:** Público (con token uniuso de 30 min)
- **Cuerpo:**
  ```json
  {
    "tokenRecuperacion": "a9f8e7d6c5b4...",
    "nuevaContrasena": "NuevaClave2026!"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Su contraseña ha sido actualizada con éxito. Ya puede iniciar sesión."
  }
  ```

#### Perfil Autenticado
- **GET** `/api/auth/perfil`
- **Acceso:** Autenticado (`Bearer <token>`)
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": {
      "uuid": "u-482a-912f-6831d15ab901",
      "nombre": "Carlos Mendoza",
      "correo": "carlos@correo.com",
      "rol": "USUARIO",
      "activo": true
    }
  }
  ```

---

### 2.2 Módulo de Cuentas (`/api/cuentas`)

#### Listar Cuentas
- **GET** `/api/cuentas`
- **Acceso:** `USUARIO` o `ADMIN`
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": [
      {
        "_id": "673cf0011234567890abcdef",
        "nombre": "Banco Principal",
        "tipo": "banco",
        "saldoInicialEnCentavos": 100000,
        "saldoActualEnCentavos": 95450,
        "activo": true
      }
    ]
  }
  ```

#### Crear Cuenta
- **POST** `/api/cuentas`
- **Cuerpo:**
  ```json
  {
    "nombre": "Billetera Efectivo",
    "tipo": "efectivo",
    "saldoInicialEnCentavos": 5000
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Cuenta creada exitosamente",
    "datos": {
      "_id": "673cf0021234567890abcdef",
      "nombre": "Billetera Efectivo",
      "tipo": "efectivo",
      "saldoInicialEnCentavos": 5000,
      "saldoActualEnCentavos": 5000
    }
  }
  ```

#### Editar Cuenta
- **PUT** `/api/cuentas/:id`
- **Cuerpo:**
  ```json
  {
    "nombre": "Efectivo Diario"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Cuenta actualizada"
  }
  ```

#### Eliminar Cuenta
- **DELETE** `/api/cuentas/:id`
- **Respuesta:**
  - Si tiene movimientos: **409 Conflict** (`No se puede eliminar una cuenta con movimientos asociados`).
  - Si no tiene movimientos: **200 OK** (`Cuenta eliminada`).

---

### 2.3 Módulo de Categorías (`/api/categorias`)

#### Listar Categorías
- **GET** `/api/categorias`
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": [
      {
        "_id": "673cf0031234567890abcdef",
        "nombre": "Alimentación",
        "tipo": "GASTO",
        "color": "#EF4444"
      }
    ]
  }
  ```

#### Crear Categoría
- **POST** `/api/categorias`
- **Cuerpo:**
  ```json
  {
    "nombre": "Transporte",
    "tipo": "GASTO",
    "color": "#3B82F6"
  }
  ```
- **Respuesta:**
  - Si ya existe con el mismo nombre y tipo: **409 Conflict** (`La categoría ya existe`).
  - Éxito: **201 Created**.

---

### 2.4 Módulo de Movimientos (`/api/movimientos`)

#### Listar Movimientos con Filtros y Paginación
- **GET** `/api/movimientos`
- **Query Params:** `desde`, `hasta`, `tipo`, `categoriaId`, `cuentaId`, `pagina`, `limite`.
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": {
      "movimientos": [
        {
          "_id": "673cf0041234567890abcdef",
          "tipo": "GASTO",
          "montoEnCentavos": 4550,
          "fecha": "2026-11-19T10:00:00.000Z",
          "descripcion": "Almuerzo",
          "categoria": {
            "_id": "673cf0031234567890abcdef",
            "nombre": "Alimentación",
            "color": "#EF4444"
          },
          "cuenta": {
            "_id": "673cf0011234567890abcdef",
            "nombre": "Banco Principal"
          }
        }
      ],
      "paginacion": {
        "paginaActual": 1,
        "totalPaginas": 1,
        "totalRegistros": 1
      }
    }
  }
  ```

#### Registrar Movimiento
- **POST** `/api/movimientos`
- **Cuerpo:**
  ```json
  {
    "tipo": "GASTO",
    "montoEnCentavos": 4550,
    "fecha": "2026-11-19",
    "descripcion": "Almuerzo",
    "categoriaId": "673cf0031234567890abcdef",
    "cuentaId": "673cf0011234567890abcdef"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Movimiento registrado exitosamente",
    "datos": {
      "_id": "673cf0041234567890abcdef",
      "saldoActualCuentaEnCentavos": 95450
    }
  }
  ```

#### Modificar Movimiento
- **PUT** `/api/movimientos/:id`
- **Descripción:** Revierte el monto previo en la cuenta y aplica el nuevo valor.

#### Eliminar Movimiento
- **DELETE** `/api/movimientos/:id`
- **Descripción:** Restaura el saldo en la cuenta y borra el movimiento.

---

### 2.5 Módulo de Presupuestos (`/api/presupuestos`)

#### Consultar Presupuesto del Mes
- **GET** `/api/presupuestos/:mes` (ej. `/api/presupuestos/2026-11`)
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": {
      "mes": "2026-11",
      "limiteEnCentavos": 200000,
      "gastadoEnCentavos": 50000,
      "disponibleEnCentavos": 150000,
      "porcentajeConsumido": 25.0,
      "estado": "OK"
    }
  }
  ```
  *(Estados: `OK` < 80%, `ALERTA` >= 80%, `EXCEDIDO` > 100%)*

#### Definir o Modificar Presupuesto
- **PUT** `/api/presupuestos/:mes`
- **Cuerpo:**
  ```json
  {
    "montoLimiteEnCentavos": 200000
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "mensaje": "Presupuesto actualizado satisfactoriamente"
  }
  ```

---

### 2.6 Módulo de Dashboard (`/api/dashboard`)

#### Resumen Mensual (KPIs)
- **GET** `/api/dashboard/resumen?mes=2026-11`
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": {
      "mes": "2026-11",
      "ingresosEnCentavos": 350000,
      "gastosEnCentavos": 145000,
      "balanceNetoEnCentavos": 205000,
      "patrimonioTotalEnCentavos": 890000
    }
  }
  ```

#### Gastos por Categoría (Gráfico Dona)
- **GET** `/api/dashboard/por-categoria?mes=2026-11`
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": [
      {
        "categoria": "Alimentación",
        "color": "#EF4444",
        "totalEnCentavos": 4550,
        "porcentaje": 31.38
      }
    ]
  }
  ```

#### Tendencia Mensual (Gráfico Barras / Línea)
- **GET** `/api/dashboard/tendencia-mensual`
- **Respuesta (200 OK):**
  ```json
  {
    "estado": "exito",
    "datos": [
      {
        "mes": "2026-06",
        "ingresosEnCentavos": 300000,
        "gastosEnCentavos": 180000
      },
      {
        "mes": "2026-11",
        "ingresosEnCentavos": 350000,
        "gastosEnCentavos": 145000
      }
    ]
  }
  ```

---

### 2.7 Módulo Administrativo (`/api/admin/usuarios`)

#### Listar Usuarios (Solo ADMIN)
- **GET** `/api/admin/usuarios`
- **Acceso:** Exclusivo `ADMIN` (retorna 403 a `USUARIO`).

#### Cambiar Rol
- **PATCH** `/api/admin/usuarios/:id/rol`
- **Cuerpo:** `{ "rol": "ADMIN" }` o `{ "rol": "USUARIO" }`
- **Restricción:** Un administrador no puede auto-quitarse su propio rol de administrador.

#### Cambiar Estado
- **PATCH** `/api/admin/usuarios/:id/estado`
- **Cuerpo:** `{ "activo": false }` o `{ "activo": true }`
