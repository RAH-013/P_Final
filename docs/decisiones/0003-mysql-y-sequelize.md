# 0003. Utilizar MySQL como base de datos y Sequelize como ORM

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

Nexus necesita almacenar información persistente, como usuarios, comentarios, favoritos y otros datos relacionados con el funcionamiento de la plataforma.

Se consideraron alternativas de almacenamiento relacional y no relacional. Debido a que los datos presentan relaciones entre entidades y requieren operaciones consistentes de consulta y modificación, se optó por una base de datos relacional.

También se necesitaba una herramienta que facilitara la interacción entre el backend y la base de datos sin tener que construir manualmente todas las consultas SQL.

## Decisión

Se decidió utilizar MySQL como sistema gestor de bases de datos y Sequelize como ORM para definir modelos, establecer relaciones y realizar operaciones sobre los datos desde el backend desarrollado con Node.js y TypeScript.

## Consecuencias

**Ventajas:**

- Permite representar relaciones entre usuarios, comentarios y favoritos.
- Facilita las operaciones CRUD mediante modelos y métodos del ORM.
- Reduce la necesidad de escribir consultas SQL directamente.
- Permite centralizar la definición de entidades y sus relaciones.
- MySQL ofrece soporte para transacciones y restricciones de integridad.

**Desventajas:**

- Es necesario mantener sincronizados los modelos del ORM y la estructura real de la base de datos.
- Las consultas complejas pueden requerir SQL personalizado.
- El uso del ORM agrega una capa de abstracción que puede dificultar el diagnóstico de problemas de rendimiento.
- Es necesario administrar las conexiones y la disponibilidad del servidor de base de datos.
