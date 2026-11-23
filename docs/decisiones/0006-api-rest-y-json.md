# 0006. Utilizar REST y JSON para la comunicación entre el frontend y el backend

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

El frontend y el backend de Nexus se ejecutan como componentes independientes y necesitan intercambiar información para realizar operaciones como autenticación, consulta de contenido, administración de comentarios y gestión de favoritos.

Se consideraron diferentes mecanismos de comunicación, entre ellos SOAP y REST. Era necesario elegir una alternativa que facilitara la integración con React y permitiera construir endpoints sencillos de consumir y mantener.

## Decisión

Se decidió implementar una API REST que utiliza los métodos HTTP correspondientes a cada operación y JSON como formato principal de intercambio de información. Las solicitudes protegidas utilizan tokens JWT mediante el encabezado HTTP `Authorization: Bearer`.

## Consecuencias

**Ventajas:**

- Facilita la integración entre React y Express.
- Utiliza estándares ampliamente soportados por navegadores y herramientas de desarrollo.
- JSON permite intercambiar información de manera sencilla.
- Los métodos HTTP permiten representar operaciones sobre los recursos de la plataforma.
- Facilita documentar y probar los endpoints mediante OpenAPI y herramientas HTTP.

**Desventajas:**

- Es necesario mantener contratos consistentes entre frontend y backend.
- Se deben gestionar correctamente los códigos HTTP y los formatos de respuesta.
- Las operaciones que involucran varios recursos pueden requerir múltiples solicitudes.
- La autenticación y autorización deben implementarse explícitamente en las rutas protegidas.
