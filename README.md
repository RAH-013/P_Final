# Nexus · API

API de recomendaciones de peliculas en base a las que ya vistes. Mediante la IA. (Mejorar, de 2 a 3 lineas)

- **Versión:** v1.0.0 (ver [CHANGELOG.md](CHANGELOG.md))
- **Lenguaje:** [Node · Express]
- **Arquitectura:** [docs/arquitectura.md](docs/arquitectura.md)

## Cómo correrla

<!-- Tutorial: alguien que nunca vio su proyecto debe poder correrlo siguiendo estos pasos, en Windows y en cmd. -->

1. Clonar el repositorio:

   ```
   git clone https://github.com/RAH-013/P_Final.git
   cd P_Final
   ```

2. Configurar las variables de entorno (ver la tabla de abajo o el env.example):
   ```
   [COMPLETAR: set JWT_SECRETO=...  (una línea por variable)]
   ```
3. Arrancar la API:
   ```
   docker compose up -d --build
   ```
4. Abrir el contrato en [COMPLETAR: http://127.0.0.1:8000/docs] y el front en [COMPLETAR: http://127.0.0.1:5500].

## Variables de entorno

Están todas en [.env.example](.env.example). **Ninguna clave real va en el repositorio.**

| Variable       | Para qué sirve             | Obligatoria |
| -------------- | -------------------------- | ----------- |
| PORT           | Define el puerto de la API | Sí          |
| NODE_ENV       | Define el puerto de la API | Sí          |
| MYSQL_HOST     | Define el puerto de la API | Sí          |
| MYSQL_PORT     | Define el puerto de la API | Sí          |
| MYSQL_USER     | Define el puerto de la API | Sí          |
| MYSQL_PASSWORD | Define el puerto de la API | Sí          |
| MYSQL_DATABASE | Define el puerto de la API | Sí          |
| JWT_SECRET     | Define el puerto de la API | Sí          |
| JWT_EXPIRES_IN | Define el puerto de la API | Sí          |
| CORS_ORIGINS   | Define el puerto de la API | No          |
| GEMINI_API_KEY | Define el puerto de la API | Sí          |

## Ejemplos de uso

<!-- Guía práctica: 2 o 3 peticiones que muestren el uso típico. -->

Entrar y obtener el token:

```
[COMPLETAR: curl -X POST http://127.0.0.1:8000/login -H "Content-Type: application/json" -d "{...}"]
```

Usar una ruta protegida:

```
[COMPLETAR: curl http://127.0.0.1:8000/[recurso] -H "Authorization: Bearer %TOKEN%"]
```

## Contrato y errores

- Contrato OpenAPI: [COMPLETAR: /docs, o el enlace a openapi.yaml]
- Errores: todos responden `{"error": "...", "detalles": [...]}`. Ver [docs/errores.md](docs/errores.md).

## Cómo probarla

```
[COMPLETAR: python probar_api.py  /  la colección de Postman y cómo correrla]
```

Resultado de la versión v1.0.0: [COMPLETAR: por ejemplo, 28 de 28 pruebas]

## Anatomía de mi API

<!-- Peguen aquí lo que copia el botón "Copiar mi lista" del mapa interactivo. -->

```
[COMPLETAR: pegar su lista]
```

## REST y SOAP en mi proyecto

[COMPLETAR: un párrafo. ¿Qué servicio SOAP podría necesitar su proyecto (SAT, un banco, un proveedor de timbrado, IMSS...)? ¿En qué pieza de su API iría y qué haría para traducir de JSON a XML y de regreso?]

## Equipo y reflexiones

<!-- Cada integrante, con sus palabras. -->

| Integrante  | Qué hizo    |
| ----------- | ----------- |
| [COMPLETAR] | [COMPLETAR] |

**[COMPLETAR: nombre]:** [COMPLETAR: ¿qué pieza le costó más y por qué? ¿Qué haría distinto si este proyecto fuera de una empresa?]
