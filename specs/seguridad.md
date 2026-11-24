# Arquitectura de Seguridad, RBAC y Aislamiento Multiinquilino

Este documento detalla la arquitectura de seguridad, control de acceso basado en roles (RBAC) y la estrategia de aislamiento por `RepositorioBase` para el **Dashboard de Finanzas Personales**.

---

## 1. Principios de Seguridad

1. **Aislamiento Multiinquilino Inmutable:** El `usuarioId` se obtiene **exclusivamente** del token JWT autenticado. Jamás se confía en el `req.body.usuarioId`.
2. **Defensa contra IDOR (Insecure Direct Object Reference):** Toda consulta a la base de datos vincula el `_id` del documento con el `usuarioId` del token. Si un usuario intenta acceder a un recurso ajeno, el sistema devuelve un **HTTP 404 Not Found** (nunca 403), evitando revelar que el ID de ese recurso existe.
3. **Privilegios RBAC Centralizados:** Las políticas de autorización se declaran en el módulo `politicas/permisos.js` y son consultadas mediante la función `puede(usuario, accion)`.
4. **Vigencia Estricta de Sesión:** El token JWT caduca en exactamente 1 hora (`expiresIn: '1h'`).

---

## 2. Matriz de Roles y Capacidades (RBAC)

El sistema define dos roles formales: `USUARIO` y `ADMIN`.

| Capacidad / Acción | Rol `USUARIO` | Rol `ADMIN` | Regla Especial |
|---|:---:|:---:|---|
| Gestionar sus propias cuentas, categorías y movimientos | Sí | Sí | Aislado a su propio `usuarioId` |
| Ver movimientos financieros de otros usuarios | **No** | **No** | Privacidad estricta de inquilino |
| Listar todos los usuarios del sistema (`GET /api/admin/usuarios`) | **No** | **Sí** | Exclusivo para administración |
| Cambiar roles de usuarios (`PATCH /api/admin/usuarios/:id/rol`) | **No** | **Sí** | Un admin no puede quitarse su propio rol |
| Modificar estado activo/inactivo de usuarios | **No** | **Sí** | Para suspender o reactivar cuentas |

### Módulo de Políticas (`politicas/permisos.js`)
```javascript
// Definición conceptual de la función puede()
export const puede = (usuario, accion, recurso = null) => {
  if (!usuario || !usuario.activo) return false;

  switch (accion) {
    case 'ADMINISTRAR_USUARIOS':
      return usuario.rol === 'ADMIN';

    case 'CAMBIAR_ROL':
      // Un administrador no puede quitarse su propio rol
      if (recurso && recurso.id === usuario.id) return false;
      return usuario.rol === 'ADMIN';

    case 'OPERAR_RECURSO_PROPIO':
      return recurso ? recurso.usuarioId.toString() === usuario.id.toString() : true;

    default:
      return false;
  }
};
```

---

## 3. Patrón `RepositorioBase` (Aislamiento de Persistencia)

Todos los repositorios dependientes (`cuentaRepositorio`, `categoriaRepositorio`, `movimientoRepositorio`, `presupuestoRepositorio`) heredan de `RepositorioBase`, garantizando que ninguna consulta omita el filtro del inquilino:

```javascript
// Clase abstracta de persistencia multiinquilino
export class RepositorioBase {
  constructor(modelo) {
    this.modelo = modelo;
  }

  async buscar(usuarioId, filtros = {}, opciones = {}) {
    return await this.modelo.find({ ...filtros, usuarioId }, null, opciones);
  }

  async buscarPorId(usuarioId, id) {
    return await this.modelo.findOne({ _id: id, usuarioId });
  }

  async crear(usuarioId, datos) {
    return await this.modelo.create({ ...datos, usuarioId });
  }

  async actualizarPorId(usuarioId, id, datos) {
    return await this.modelo.findOneAndUpdate(
      { _id: id, usuarioId },
      datos,
      { new: true, runValidators: true }
    );
  }

  async eliminarPorId(usuarioId, id) {
    return await this.modelo.findOneAndDelete({ _id: id, usuarioId });
  }
}
```

---

## 4. Autenticación con JWT (1h) y Passport-JWT

- **Estrategia:** `passport-jwt` (`JwtStrategy`).
- **Extractor:** `ExtractJwt.fromAuthHeaderAsBearerToken()`.
- **Payload:** `{ id: usuario.uuid, correo: usuario.correo, rol: usuario.rol }`.
- **Expiración:** 1 hora (`1h`).
- **Middleware `autenticar`:** Valida el token y setea `req.usuario`. Si el token caducó, responde HTTP 401 informando la expiración de la sesión.
- **Middleware `autorizar(...roles)`:** Verifica que `req.usuario.rol` pertenezca a la lista autorizada. Si no, responde HTTP 403.

---

## 5. Recuperación Segura de Contraseña

1. **Token Criptográfico:** `crypto.randomBytes(32).toString('hex')`.
2. **Hash en Base de Datos:** Solo se almacena `crypto.createHash('sha256').update(token).digest('hex')`.
3. **Vigencia:** 30 minutos a partir de su generación.
4. **Un Solo Uso:** Al restablecer la clave, el hash y la expiración se limpian inmediatamente de la base de datos.
5. **Mitigación de Enumeración:** `POST /api/auth/olvide-contrasena` responde siempre exactamente el mismo mensaje de éxito, exista o no el correo ingresado.

---

## 6. Hardening Perimetral

- **Helmet:** Protección de cabeceras HTTP y eliminación de `X-Powered-By`.
- **CORS Restringido:** Permite peticiones únicamente desde la URL del cliente (`CLIENT_URL = http://localhost:5173`).
- **Límite de Intentos en Login:** 5 intentos fallidos consecutivos bloquean temporalmente la cuenta por 15 minutos (HTTP 429).
- **Manejador de Errores Uniforme:** Errores capturados centralizadamente devolviendo `{ estado, mensaje, errores? }`.
