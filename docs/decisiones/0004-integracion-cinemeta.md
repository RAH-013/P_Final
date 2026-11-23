# 0004. Utilizar Cinemeta como proveedor de metadatos multimedia

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

Nexus necesita consultar información de películas y series, como títulos, descripciones, imágenes, fechas de lanzamiento y otros metadatos necesarios para mostrar el contenido y construir las funcionalidades de la plataforma.

Desarrollar y mantener una base de datos propia con información multimedia requeriría obtener, actualizar y administrar constantemente un catálogo de contenido.

Por ello, se consideró utilizar un proveedor externo que ofreciera acceso a información multimedia mediante una API.

## Decisión

Se decidió integrar Cinemeta como proveedor externo de metadatos multimedia. El backend consulta sus servicios mediante solicitudes HTTP y procesa las respuestas JSON para proporcionar la información necesaria al frontend.

## Consecuencias

**Ventajas:**

- Evita mantener manualmente un catálogo completo de películas y series.
- Permite consultar información multimedia actualizada por el proveedor.
- Reduce el trabajo necesario para incorporar contenido al catálogo.
- Facilita la búsqueda y visualización de películas y series mediante identificadores externos.

**Desventajas:**

- La disponibilidad de determinadas funcionalidades depende de un servicio externo.
- Los cambios en la estructura de las respuestas pueden requerir modificaciones en el backend.
- La latencia de las consultas externas puede afectar los tiempos de respuesta.
- Es necesario controlar errores, tiempos de espera y respuestas inesperadas.
- Nexus depende de la disponibilidad y continuidad del proveedor.
