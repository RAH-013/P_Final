# 0001. Utilizar JWT para la autenticación de usuarios

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

Nexus necesita identificar a los usuarios que acceden a la plataforma y controlar el acceso a funcionalidades protegidas, como la administración de favoritos y comentarios.

Se consideraron diferentes mecanismos de autenticación, entre ellos el uso de sesiones tradicionales almacenadas en el servidor y tokens de autenticación. Debido a que el frontend y el backend se ejecutan como componentes independientes y se comunican mediante una API REST, era necesario contar con un mecanismo que permitiera verificar la identidad del usuario en cada solicitud protegida.

## Decisión

Se decidió utilizar JSON Web Tokens (JWT) para autenticar las solicitudes al backend. El cliente debe enviar el token mediante el encabezado HTTP `Authorization: Bearer`, y el backend verifica su validez antes de permitir el acceso a las rutas protegidas.

## Consecuencias

**Ventajas:**

- Permite autenticar solicitudes sin mantener una sesión tradicional en memoria del servidor.
- Facilita la comunicación entre el frontend y el backend.
- Permite proteger endpoints y controlar el acceso según la identidad y los permisos del usuario.
- Es compatible con clientes distintos al frontend principal, siempre que implementen el mecanismo de autenticación.

**Desventajas:**

- Es necesario proteger el secreto utilizado para firmar los tokens.
- Los tokens pueden permanecer válidos hasta su expiración si no existe un mecanismo adicional de revocación.
- El cliente debe gestionar el almacenamiento y envío seguro del token.
- Se debe implementar correctamente la expiración y validación de los tokens para evitar accesos no autorizados.
