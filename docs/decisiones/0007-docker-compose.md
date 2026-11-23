# 0007. Utilizar Docker Compose para administrar los servicios de Nexus

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

Nexus está compuesto por varios servicios independientes, entre ellos el frontend, el backend y la base de datos. Además, durante las pruebas de integración se utiliza un simulador de servicios externos.

Ejecutar y configurar cada componente manualmente puede generar diferencias entre los entornos de desarrollo y producción, además de dificultar la puesta en marcha del proyecto en otros equipos.

Se consideró ejecutar los servicios de forma individual o utilizar contenedores para estandarizar su configuración y despliegue.

## Decisión

Se decidió utilizar Docker Compose para definir, configurar y ejecutar los servicios de Nexus mediante archivos YAML. Cada servicio cuenta con su propia configuración, variables de entorno, redes y dependencias, permitiendo levantar el entorno de aplicación mediante comandos centralizados.

## Consecuencias

**Ventajas:**

- Facilita levantar los servicios necesarios con un solo comando.
- Reduce diferencias entre los entornos de desarrollo y producción.
- Permite aislar las dependencias de cada componente.
- Facilita la configuración de redes y comunicación entre contenedores.
- Permite administrar volúmenes para conservar los datos de MySQL.
- Simplifica la incorporación de nuevos servicios al entorno.

**Desventajas:**

- Requiere administrar imágenes, contenedores, redes y volúmenes.
- El diagnóstico de errores puede necesitar revisar los logs de varios servicios.
- Es necesario gestionar correctamente los archivos de variables de entorno y los secretos.
- Los datos persistentes requieren respaldos y estrategias de recuperación.
- Docker Compose no sustituye una plataforma de orquestación para escenarios de alta disponibilidad y escalabilidad distribuida.
