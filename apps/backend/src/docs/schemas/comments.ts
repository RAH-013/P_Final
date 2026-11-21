/**
 * @openapi
 * /comments/{mediaType}/{externalId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Obtener comentarios de una película o serie
 *     parameters:
 *       - in: path
 *         name: mediaType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [movie, series]
 *         example: movie
 *       - in: path
 *         name: externalId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^tt\d+$'
 *         example: tt0111161
 *     responses:
 *       200:
 *         description: Comentarios obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comentarios obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Parámetros inválidos
 *
 * /comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Publicar comentario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalId
 *               - mediaType
 *               - content
 *             properties:
 *               externalId:
 *                 type: string
 *                 pattern: '^tt\d+$'
 *                 example: tt0111161
 *               mediaType:
 *                 type: string
 *                 enum: [movie, series]
 *                 example: movie
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: Una excelente película, muy recomendable.
 *     responses:
 *       201:
 *         description: Comentario publicado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Película o serie no encontrada
 *       502:
 *         description: Error al consultar Cinemeta
 *
 * /comments/{id}:
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Actualizar comentario propio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: Comentario actualizado.
 *     responses:
 *       200:
 *         description: Comentario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tienes permiso para modificar este comentario
 *       404:
 *         description: Comentario no encontrado
 *
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Eliminar comentario propio o de otro usuario como administrador
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tienes permiso para eliminar este comentario
 *       404:
 *         description: Comentario no encontrado
 *
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - externalId
 *         - mediaType
 *         - content
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         userId:
 *           type: integer
 *           example: 3
 *         externalId:
 *           type: string
 *           example: tt0111161
 *         mediaType:
 *           type: string
 *           enum: [movie, series]
 *           example: movie
 *         content:
 *           type: string
 *           example: Una excelente película, muy recomendable.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 */
export {};
