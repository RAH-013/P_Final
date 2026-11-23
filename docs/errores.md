# **Catálogo de errores**

Todos los errores de la API utilizan una estructura JSON uniforme:

```json
{
  "error": "Mensaje para el usuario",
  "detalles": ["Detalle del error, si aplica"]
}
```

El campo `error` contiene una descripción general del problema, mientras que `detalles` proporciona información adicional, especialmente cuando existen errores de validación.

| Código  | Cuándo                                                                                                                      | Ejemplo de mensaje                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **400** | La solicitud contiene datos inválidos, faltantes o no cumple con las validaciones requeridas.                               | `"error": "Datos de entrada inválidos"`                                |
| **401** | No se proporciona un token de autenticación, es inválido o ha expirado.                                                     | `"error": "No autorizado"`                                             |
| **403** | El usuario está autenticado, pero no tiene permisos para realizar la operación solicitada.                                  | `"error": "No tienes permisos para realizar esta operación"`           |
| **404** | El recurso solicitado no existe o no está disponible para el usuario.                                                       | `"error": "Recurso no encontrado"`                                     |
| **409** | La operación entra en conflicto con el estado actual de los datos, por ejemplo, al intentar registrar un recurso duplicado. | `"error": "El recurso ya existe"`                                      |
| **422** | Los datos tienen un formato válido, pero no pueden procesarse por incumplir una regla de negocio.                           | `"error": "No se puede procesar la solicitud"`                         |
| **502** | Un servicio externo devuelve una respuesta inválida o inesperada.                                                           | `"error": "Error en la respuesta del servicio externo"`                |
| **503** | Un servicio necesario no está disponible temporalmente.                                                                     | `"error": "Servicio temporalmente no disponible"`                      |
| **504** | Un servicio externo no responde dentro del tiempo de espera establecido.                                                    | `"error": "Tiempo de espera agotado al consultar el servicio externo"` |

## Consideraciones

- Los errores de validación pueden incluir en `detalles` los campos que presentan problemas.
- Los errores de autenticación y autorización no deben revelar información sensible.
- Los errores de servicios externos deben evitar exponer credenciales, direcciones internas o detalles de infraestructura.
- Los códigos HTTP deben corresponder con la naturaleza del error y mantenerse consistentes en todos los endpoints.
- Los errores inesperados deben registrarse en los logs del backend sin exponer información interna al cliente.
