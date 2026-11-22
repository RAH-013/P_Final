import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { stringify } from "yaml";
import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = __dirname.split(path.sep).includes("dist");

const docsPath = path.resolve(
  __dirname,
  isProduction ? "../../src/docs/schemas/**/*.ts" : "./schemas/**/*.ts",
);

const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Nexus API REST",
      version: "1.0.0",
      description: `
# Nexus API REST

## Descripción general

Nexus API es el servicio backend de **Nexus**, una plataforma orientada al descubrimiento, exploración y gestión personalizada de películas y series.

Proporciona una interfaz REST para que las aplicaciones cliente puedan acceder al catálogo audiovisual, administrar cuentas de usuario y gestionar las interacciones personales con el contenido. Centraliza la lógica de negocio, la autenticación, el control de acceso y la comunicación con servicios externos.

La API está organizada en módulos independientes que permiten mantener separadas las responsabilidades relacionadas con usuarios, preferencias, contenido audiovisual y recomendaciones.

## Funcionalidades principales

### Autenticación y sesiones
Gestiona el registro y acceso de usuarios mediante credenciales. Utiliza JSON Web Tokens (JWT) para identificar las sesiones y proteger los recursos que requieren autenticación.

### Usuarios
Proporciona operaciones para consultar y administrar cuentas de usuario, así como la información asociada a sus perfiles.

### Géneros preferidos
Permite gestionar las preferencias audiovisuales de cada usuario mediante la selección de géneros, utilizadas para personalizar su experiencia dentro de la plataforma.

### Favoritos
Administra la colección personal de películas y series favoritas. Permite agregar contenido, consultar los registros individuales o la colección completa y eliminar favoritos. Las operaciones se encuentran vinculadas al usuario autenticado.

### Comentarios
Gestiona los comentarios asociados a películas y series. Permite consultar comentarios generales o relacionados con un contenido específico, publicar nuevas opiniones, editar comentarios propios y eliminarlos de acuerdo con los permisos del usuario y las reglas administrativas.

### Catálogo audiovisual
Proporciona funcionalidades de búsqueda y consulta de películas y series mediante la integración con **Cinemeta**. Utiliza identificadores externos para localizar contenido y recuperar sus metadatos.

### Recomendaciones
Gestiona el contenido recomendado para los usuarios y el historial de recomendaciones. Permite consultar recomendaciones disponibles y recuperar contenido previamente recomendado, aplicando las reglas del módulo para evitar presentar elementos que ya no deben formar parte de las recomendaciones disponibles.

### Integración externa
Incluye un mecanismo de intermediación HTTP que permite reenviar solicitudes hacia un servicio externo configurable mediante la variable de entorno \`EXTERNO_URL\`. Puede transmitir métodos HTTP, cabeceras permitidas y cuerpos JSON, conservando el código HTTP de las respuestas recibidas.

Esta integración es opcional. Cuando no está configurada, las funcionalidades que dependen de ella no están disponibles, sin impedir el funcionamiento de los demás módulos de la API.

## Arquitectura y comunicación

La API sigue el estilo arquitectónico REST y utiliza JSON como formato principal de intercambio de información.

Las solicitudes se procesan mediante rutas, controladores y servicios que separan la recepción de peticiones HTTP de la lógica de negocio y el acceso a los datos.

Los recursos se organizan por módulos funcionales y utilizan códigos de estado HTTP para comunicar el resultado de las operaciones.

## Autenticación y autorización

Los endpoints que requieren autenticación utilizan tokens JWT.

El token debe enviarse en la cabecera HTTP \`Authorization\` con el esquema Bearer:

\`\`\`http
Authorization: Bearer <token>
\`\`\`

El token se obtiene mediante los endpoints de autenticación. La API verifica su firma, vigencia y versión de sesión antes de permitir el acceso a los recursos protegidos.

Las operaciones sobre información personal se ejecutan dentro del contexto del usuario autenticado. Los endpoints que contemplan privilegios administrativos aplican las restricciones de autorización correspondientes.

Los endpoints públicos no requieren enviar un token, salvo que su documentación indique lo contrario.

## Validación y manejo de errores

Las solicitudes se validan antes de ejecutar las operaciones correspondientes. Los parámetros de ruta, datos de consulta y cuerpos de las solicitudes deben cumplir los formatos y restricciones definidos por cada endpoint.

Las respuestas de error utilizan códigos HTTP para identificar situaciones como:

- **400 Bad Request:** parámetros, datos o formatos inválidos.
- **401 Unauthorized:** falta de autenticación, token inválido o sesión no vigente.
- **403 Forbidden:** el usuario autenticado no tiene permisos para realizar la operación.
- **404 Not Found:** el recurso solicitado no existe o no está disponible para el usuario.
- **409 Conflict:** conflicto con el estado actual del recurso.
- **500 Internal Server Error:** error interno durante el procesamiento.
- **502 Bad Gateway:** error al comunicarse con un servicio externo o respuesta externa no válida.
- **503 Service Unavailable:** integración externa no configurada o servicio no disponible.
- **504 Gateway Timeout:** el servicio externo excedió el tiempo de espera.

La estructura concreta de cada respuesta de error se especifica en la documentación del endpoint correspondiente.

## Integraciones externas

### Cinemeta

Cinemeta proporciona información del catálogo audiovisual utilizada en las operaciones de búsqueda, consulta y validación de películas y series.

### Servicio externo configurable

La API puede actuar como intermediaria entre el cliente y otro servicio HTTP. Su dirección base se establece mediante \`EXTERNO_URL\`.

La comunicación contempla un tiempo máximo de espera y reintentos para determinados errores de conexión y respuestas temporales del servicio externo.

La disponibilidad de estas integraciones depende de los servicios de terceros y no sustituye las funcionalidades internas de la API.

## Convenciones de la API

- **Protocolo:** HTTP/HTTPS.
- **Estilo:** REST.
- **Formato de intercambio:** JSON.
- **Autenticación:** JWT mediante Bearer Token.
- **Especificación:** OpenAPI 3.0.3.
- **Identificación audiovisual:** identificadores externos de Cinemeta, como los identificadores con formato IMDb \`tt1234567\`.

## Documentación interactiva

Esta especificación permite consultar los endpoints disponibles, revisar sus parámetros y estructuras de datos, conocer los códigos de respuesta y ejecutar solicitudes directamente desde Swagger UI.

Los endpoints protegidos pueden probarse utilizando el botón **Authorize** e introduciendo un token JWT válido.
      `,
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "/",
        description: "Servidor de Nexus API",
      },
    ],
    tags: [
      {
        name: "Auth",
        description:
          "Registro de usuarios, autenticación mediante credenciales, emisión de tokens JWT y gestión de sesiones.",
      },
      {
        name: "Users",
        description:
          "Consulta y administración de cuentas de usuario e información de perfil.",
      },
      {
        name: "Genres",
        description:
          "Consulta y administración de los géneros audiovisuales preferidos por cada usuario.",
      },
      {
        name: "Likes",
        description:
          "Gestión de películas y series favoritas. Cada usuario puede consultar y modificar exclusivamente los favoritos asociados a su cuenta.",
      },
      {
        name: "Comments",
        description:
          "Publicación y consulta de comentarios asociados al catálogo audiovisual, así como edición y eliminación sujetas a permisos de autoría y administración.",
      },
      {
        name: "Catalog",
        description:
          "Búsqueda y consulta de películas y series mediante Cinemeta, incluyendo la recuperación de metadatos e identificación del contenido.",
      },
      {
        name: "Recommendations",
        description:
          "Consulta y gestión de recomendaciones audiovisuales, incluyendo el historial y la disponibilidad de contenido recomendado.",
      },
      {
        name: "External",
        description:
          "Intermediación de solicitudes HTTP hacia un servicio externo configurable. Permite reenviar métodos, cabeceras permitidas y cuerpos JSON.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Introduce el token JWT obtenido mediante el inicio de sesión. No incluyas el prefijo Bearer.",
        },
      },
    },
  },
  apis: [docsPath],
});

export function setupSwagger(app: Express): void {
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openapiSpec);
  });

  app.get("/api/openapi.yml", (_req, res) => {
    res.type("application/yaml").send(stringify(openapiSpec));
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: "Nexus API | Documentación",
      explorer: true,
    }),
  );
}

export default openapiSpec;
