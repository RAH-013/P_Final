# 0002. Separar el frontend y el backend mediante una arquitectura cliente-servidor

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

Nexus necesita ofrecer una interfaz para que los usuarios consulten películas y series, administren sus cuentas y utilicen las funcionalidades de recomendación. También necesita gestionar la autenticación, las reglas de negocio, las consultas a la base de datos y las integraciones con servicios externos.

Se consideraron dos alternativas: desarrollar la interfaz y la lógica del servidor dentro de una misma aplicación o mantenerlas como componentes independientes que se comuniquen mediante una API.

## Decisión

Se decidió implementar una arquitectura cliente-servidor, separando el frontend desarrollado con React y el backend desarrollado con Node.js y Express. Ambos componentes se comunican mediante una API REST utilizando HTTP y JSON.

## Consecuencias

**Ventajas:**

- Permite desarrollar y mantener el frontend y el backend de manera independiente.
- Facilita la reutilización de la API por otros clientes.
- Separa las responsabilidades de presentación y lógica de negocio.
- Permite desplegar y actualizar cada componente por separado.

**Desventajas:**

- Requiere administrar la comunicación entre ambos componentes.
- Es necesario configurar CORS y gestionar correctamente los errores de conexión.
- Aumenta la complejidad del despliegue y la configuración del entorno.
- Los cambios en los contratos de la API pueden requerir modificaciones en el frontend.
