/**
 * @openapi
 * /api/external/{path}:
 *   get:
 *     tags:
 *       - External
 *     summary: Reenviar una consulta GET al servicio externo
 *     description: Reenvía la solicitud al servicio externo configurado mediante EXTERNO_URL. Conserva los parámetros de consulta y reenvía las cabeceras permitidas.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         description: Ruta del endpoint del servicio externo.
 *         schema:
 *           type: string
 *         example: v1/models
 *       - in: query
 *         name: query
 *         required: false
 *         description: Parámetros adicionales que serán reenviados al servicio externo.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Respuesta del servicio externo
 *       400:
 *         description: Solicitud inválida
 *       502:
 *         description: No fue posible comunicarse con el servicio externo o la respuesta recibida no es válida
 *       503:
 *         description: La integración externa no está configurada
 *       504:
 *         description: El servicio externo excedió el tiempo de espera
 *
 *   post:
 *     tags:
 *       - External
 *     summary: Reenviar una solicitud POST al servicio externo
 *     description: Envía el cuerpo JSON y las cabeceras permitidas al servicio externo.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         description: Ruta del endpoint del servicio externo.
 *         schema:
 *           type: string
 *         example: v1/models
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *           example:
 *             contents:
 *               - parts:
 *                   - text: Genera una recomendación
 *     responses:
 *       200:
 *         description: Respuesta del servicio externo
 *       400:
 *         description: Solicitud inválida
 *       502:
 *         description: No fue posible comunicarse con el servicio externo o la respuesta recibida no es válida
 *       503:
 *         description: La integración externa no está configurada
 *       504:
 *         description: El servicio externo excedió el tiempo de espera
 *
 *   put:
 *     tags:
 *       - External
 *     summary: Reenviar una solicitud PUT al servicio externo
 *     description: Reenvía el cuerpo JSON y las cabeceras permitidas al servicio externo.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Respuesta del servicio externo
 *       502:
 *         description: Error de comunicación con el servicio externo
 *       503:
 *         description: La integración externa no está configurada
 *       504:
 *         description: Tiempo de espera agotado
 *
 *   patch:
 *     tags:
 *       - External
 *     summary: Reenviar una solicitud PATCH al servicio externo
 *     description: Reenvía el cuerpo JSON y las cabeceras permitidas al servicio externo.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Respuesta del servicio externo
 *       502:
 *         description: Error de comunicación con el servicio externo
 *       503:
 *         description: La integración externa no está configurada
 *       504:
 *         description: Tiempo de espera agotado
 *
 *   delete:
 *     tags:
 *       - External
 *     summary: Reenviar una solicitud DELETE al servicio externo
 *     description: Reenvía la solicitud DELETE al servicio externo configurado.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Respuesta del servicio externo
 *       502:
 *         description: Error de comunicación con el servicio externo
 *       503:
 *         description: La integración externa no está configurada
 *       504:
 *         description: Tiempo de espera agotado
 *
 * components:
 *   schemas:
 *     ExternalError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: No fue posible comunicarse con el servicio externo
 *         status:
 *           type: integer
 *           example: 502
 *         details:
 *           nullable: true
 *           example: Connection refused
 */
export {};
