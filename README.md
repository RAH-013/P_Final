# Nexus · API

Nexus es una API REST para una plataforma de descubrimiento y recomendación de películas y series. Integra información de Cinemeta y utiliza inteligencia artificial mediante Gemini para generar recomendaciones a partir de los intereses y preferencias del usuario.

Incluye autenticación, gestión de usuarios, comentarios, favoritos y servicios externos, con persistencia en MySQL y una arquitectura organizada por responsabilidades.

- **Versión:** v1.0.0 (ver [CHANGELOG.md](CHANGELOG.md))
- **Lenguaje y framework:** Node.js · Express · TypeScript
- **Base de datos:** MySQL · Sequelize
- **Inteligencia artificial:** Google Gemini
- **Fuente de información multimedia:** Cinemeta
- **Arquitectura:** [docs/arquitectura.md](docs/arquitectura.md)

## Cómo correrla

Requisitos:

- Git.
- Docker Desktop con Docker Compose.
- Python 3 para ejecutar las pruebas automatizadas.

Los siguientes pasos están escritos para Windows y CMD.

1. Clonar el repositorio:

   ```cmd
   git clone https://github.com/RAH-013/P_Final.git
   cd P_Final
   ```

2. Crear el archivo de variables de entorno:

   ```cmd
   copy .env.example .env
   notepad .env
   ```

   Configurar los valores necesarios. No utilizar las credenciales de ejemplo en un entorno de producción.

3. Arrancar la aplicación en producción:

   ```cmd
   docker compose up -d --build
   ```

   Para ejecutar el entorno de desarrollo:

   ```cmd
   docker compose -f docker-compose.yml -f compose.dev.yaml up --build
   ```

4. Acceder a los servicios:
   - **API:** http://localhost:3000
   - **Contrato OpenAPI:** http://localhost:3000/api/openapi.yml
   - **Frontend:** http://localhost:8080
   - **Simulador externo:** http://localhost:9000

   El contrato OpenAPI se encuentra disponible como archivo YAML; no se debe confundir con una interfaz Swagger en `/docs`.

Para detener los contenedores:

```cmd
docker compose down
```

## Variables de entorno

Las variables se encuentran documentadas en [.env.example](.env.example). Las claves reales no deben subirse al repositorio.

| Variable         | Descripción                                                               | Obligatoria                  |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------- |
| `PORT`           | Puerto en el que escucha el backend.                                      | Sí                           |
| `NODE_ENV`       | Define el entorno de ejecución.                                           | Sí                           |
| `MYSQL_HOST`     | Host del servidor MySQL.                                                  | Sí                           |
| `MYSQL_PORT`     | Puerto de conexión a MySQL.                                               | Sí                           |
| `MYSQL_USER`     | Usuario de la base de datos.                                              | Sí                           |
| `MYSQL_PASSWORD` | Contraseña de MySQL.                                                      | Sí                           |
| `MYSQL_DATABASE` | Nombre de la base de datos.                                               | Sí                           |
| `JWT_SECRET`     | Secreto utilizado para firmar y verificar tokens JWT.                     | Sí                           |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens JWT.                                   | Sí                           |
| `CORS_ORIGINS`   | Orígenes permitidos para las solicitudes al backend.                      | No                           |
| `GEMINI_API_KEY` | Clave de acceso a Google Gemini.                                          | Según la funcionalidad de IA |
| `GEMINI_MODEL`   | Modelo de Gemini utilizado para generar recomendaciones.                  | No                           |
| `EXTERNO_URL`    | Dirección del servicio externo utilizado para las pruebas de integración. | Sí para integración externa  |

Ejemplo de configuración:

```env
PORT=3000
NODE_ENV=development

MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=myapp

JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGINS=*

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite

EXTERNO_URL=http://simulador:9000
```

**Importante:** los valores anteriores son de ejemplo. `MYSQL_HOST=mysql` y `EXTERNO_URL=http://simulador:9000` corresponden a la comunicación entre servicios dentro de Docker Compose. Verifica que los nombres de las variables coincidan exactamente con los definidos en el esquema de configuración del backend.

## Ejemplos de uso

Los siguientes ejemplos utilizan CMD de Windows.

### 1. Iniciar sesión y obtener un token

```cmd
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"usuario@ejemplo.com\",\"password\":\"tu_password\"}"
```

La respuesta contiene el token de autenticación. Copia su valor y asígnalo a la variable `TOKEN`:

```cmd
set TOKEN=PEGA_AQUI_TU_TOKEN
```

### 2. Consultar los favoritos del usuario

```cmd
curl http://localhost:3000/api/likes -H "Authorization: Bearer %TOKEN%"
```

### 3. Agregar una película a favoritos

```cmd
curl -X POST http://localhost:3000/api/likes -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"externalId\":\"tt22084616\",\"mediaType\":\"movie\"}"
```

Las rutas protegidas requieren un token JWT válido.

## Contrato y errores

- **Contrato OpenAPI:** [api/openapi.yml](http://localhost:3000/api/openapi.yml).
- **Documentación de errores:** [docs/errores.md](docs/errores.md).

Las respuestas de error utilizan una estructura común:

```json
{
  "error": "Descripción del error",
  "detalles": []
}
```

Los códigos HTTP permiten identificar el resultado de cada operación, por ejemplo: `400` para solicitudes inválidas, `401` para falta de autenticación, `403` para operaciones no autorizadas y `404` para recursos inexistentes.

## Cómo probarla

Con el backend, MySQL y los servicios necesarios levantados, ejecutar desde la raíz del proyecto:

```cmd
python probar_api.py
```

El script realiza pruebas automatizadas sobre las operaciones de la API, incluyendo:

- Creación, consulta, actualización y eliminación de recursos.
- Validación de datos y manejo de errores.
- Autenticación mediante JWT.
- Control de acceso y privacidad de recursos.
- Integración con servicios externos y manejo de fallos.
- Configuración de CORS y preflight `OPTIONS`.
- Disponibilidad del contrato OpenAPI.

**Resultado de la versión v1.0.0:** [COMPLETAR con el resultado real del script, por ejemplo: 28 de 28 pruebas aprobadas].

## Anatomía de mi API

La API está organizada para separar las responsabilidades de cada componente:

- **Routes:** definen los endpoints y sus métodos HTTP.
- **Controllers:** gestionan las solicitudes, validaciones de entrada y respuestas HTTP.
- **Services:** contienen la lógica de negocio y las operaciones de acceso a datos.
- **Models:** representan las entidades y su relación con la base de datos mediante Sequelize.
- **Middlewares:** gestionan autenticación, autorización y procesamiento de solicitudes.
- **Config:** centraliza la configuración y las conexiones externas.
- **Docs:** contiene el contrato OpenAPI y la documentación técnica.

```text
[PEGAR AQUÍ LA LISTA EXACTA GENERADA POR EL MAPA INTERACTIVO]
```

## REST y SOAP en mi proyecto

Nexus utiliza REST para exponer sus funcionalidades, ya que permite integrar fácilmente el frontend con el backend mediante HTTP y el intercambio de información en JSON. Sin embargo, podría necesitar SOAP si en el futuro incorporara un servicio externo que lo exigiera, por ejemplo, un proveedor de facturación electrónica que se comunicara mediante los servicios web del SAT. Esta integración se implementaría en una capa de servicios o adaptadores del backend, encargada de transformar las solicitudes JSON de Nexus a mensajes XML SOAP, consumir el servicio externo y convertir sus respuestas XML nuevamente a JSON. De esta manera, el frontend y el resto de la API conservarían su comunicación REST sin depender directamente de SOAP.

## Equipo y reflexiones

| Integrante                        | Qué hizo                                        |
| --------------------------------- | ----------------------------------------------- |
| Anguiano Hernández Ricardo        | Desarrollador Full-Stack                        |
| Aviña Martinez Luis Fernando      | [Responsabilidades y componentes desarrollados] |
| Fajardo Williams Romina Elizabeth | Diseño de interfaz, apoyo y revisión general del proyecto. |

**Ricardo**: La parte que más me costó fue integrar los diferentes servicios del proyecto y conseguir que funcionaran correctamente en conjunto, principalmente porque cada componente tiene sus propias configuraciones, dependencias y formas de comunicación. Tuve que resolver problemas relacionados con la autenticación, la persistencia de datos, las respuestas de servicios externos y la configuración de Docker Compose. Esto me permitió comprender mejor cómo se relacionan las distintas capas de una aplicación y la importancia de manejar adecuadamente los errores.

Si el proyecto se desarrollara en una empresa, mejoraría principalmente la cobertura de pruebas automatizadas, el monitoreo de los servicios y la gestión de errores. También reforzaría la seguridad de las integraciones externas y establecería procesos de despliegue más controlados. Esto facilitaría el mantenimiento del sistema, permitiría detectar problemas antes de llegar a producción y prepararía la plataforma para crecer sin comprometer su estabilidad.

**Romina:** Una de las partes que más se me complicó durante el proyecto fue comprender cómo se relacionaban los diferentes componentes de Nexus, especialmente la comunicación entre el frontend y el backend, así como algunas funciones del código. Aunque mi participación estuvo más enfocada en el diseño de la interfaz y el apoyo en la revisión del proyecto, también tuve que familiarizarme con su funcionamiento para entender mejor cómo trabajaban los diferentes servicios.

Si el proyecto se desarrollara en una empresa, mejoraría principalmente la organización del trabajo y la documentación, para que cada integrante pudiera comprender más fácilmente las funciones de los demás. También dedicaría más tiempo a realizar pruebas de usabilidad y mejorar la interfaz, buscando que la aplicación fuera más intuitiva y sencilla de utilizar.