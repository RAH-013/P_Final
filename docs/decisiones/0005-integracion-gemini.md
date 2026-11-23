# 0005. Integrar Google Gemini para generar recomendaciones mediante inteligencia artificial

- **Fecha:** 2026-11-23
- **Estado:** Aceptada

## Contexto

Nexus busca ofrecer recomendaciones de películas y series que consideren los intereses y preferencias de los usuarios.

Una alternativa sería implementar un sistema de recomendaciones basado exclusivamente en reglas predefinidas o algoritmos tradicionales. Sin embargo, también se buscaba incorporar inteligencia artificial para procesar información y generar recomendaciones de manera más flexible.

## Decisión

Se decidió integrar Google Gemini como servicio externo de inteligencia artificial. El backend se encarga de enviar las solicitudes al modelo configurado, procesar sus respuestas y proporcionar las recomendaciones al frontend sin exponer directamente las credenciales del proveedor.

## Consecuencias

**Ventajas:**

- Permite generar recomendaciones mediante modelos de inteligencia artificial.
- Facilita adaptar las recomendaciones a los intereses y preferencias de los usuarios.
- Evita implementar y entrenar un modelo propio.
- Permite cambiar el modelo utilizado mediante configuración, cuando la integración lo permita.

**Desventajas:**

- La generación de recomendaciones depende de la disponibilidad del proveedor.
- El uso de la API puede estar sujeto a cuotas, límites y costos.
- Las respuestas generadas pueden ser imprecisas o contener información incorrecta.
- Es necesario validar y controlar las respuestas antes de utilizarlas.
- Se deben proteger las credenciales y evitar enviar información personal innecesaria.
- Es necesario contemplar un comportamiento alternativo cuando el servicio no esté disponible o no se encuentre configurado.
