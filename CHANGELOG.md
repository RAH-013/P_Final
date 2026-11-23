# Changelog

Todos los cambios importantes de Nexus se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) y el proyecto utiliza [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-23

### Agregado

- Plataforma web para descubrir y consultar películas y series.
- API REST desarrollada con Node.js, Express y TypeScript.
- Integración con Cinemeta para consultar metadatos de películas y series.
- Integración con Google Gemini para generar recomendaciones mediante inteligencia artificial.
- Sistema de autenticación mediante JWT.
- Control de acceso a rutas protegidas mediante autenticación y autorización.
- Gestión de usuarios y sus operaciones dentro de la plataforma.
- Gestión de comentarios asociados a películas y series.
- Gestión de favoritos para usuarios autenticados.
- Persistencia de información mediante MySQL y Sequelize.
- Validación de datos de entrada y manejo centralizado de errores.
- Protección de solicitudes mediante configuración CORS.
- Documentación del contrato de la API mediante OpenAPI.
- Integración con servicios externos mediante solicitudes HTTP y respuestas JSON.
- Control de tiempos de espera y manejo de errores en las integraciones externas.
- Configuración de contenedores y servicios mediante Docker Compose.
- Pruebas automatizadas para validar endpoints, autenticación, autorización, persistencia, CORS e integraciones externas.

### Pendiente

- Ampliar la cobertura de pruebas automatizadas.
- Mejorar el sistema de recomendaciones considerando el historial y las preferencias de cada usuario.
- Incorporar mecanismos de caché para reducir solicitudes repetidas a servicios externos.
- Mejorar el monitoreo y registro de errores en producción.
- Fortalecer las estrategias de recuperación ante fallos de servicios externos.
- Optimizar el rendimiento de consultas y operaciones sobre la base de datos.
- Incorporar nuevas funcionalidades para descubrir y consultar dónde están disponibles las películas y series.
- Mejorar la experiencia de usuario y la accesibilidad de la plataforma.
