/**
 * @openapi
 * /likes:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Obtener películas y series favoritas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoritos obtenidos correctamente
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
 *                   example: Favoritos obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Like'
 *       401:
 *         description: No autenticado
 *
 *   post:
 *     tags:
 *       - Likes
 *     summary: Agregar película o serie a favoritos
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
 *             properties:
 *               externalId:
 *                 type: string
 *                 pattern: '^tt\d+$'
 *                 example: tt0111161
 *               mediaType:
 *                 type: string
 *                 enum: [movie, series]
 *                 example: movie
 *     responses:
 *       201:
 *         description: Contenido agregado a favoritos
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
 *                   example: Contenido agregado a favoritos
 *                 data:
 *                   $ref: '#/components/schemas/Like'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Película o serie no encontrada
 *       409:
 *         description: El contenido ya está en favoritos
 *       502:
 *         description: Error al consultar Cinemeta
 *
 * /likes/{mediaType}/{externalId}:
 *   delete:
 *     tags:
 *       - Likes
 *     summary: Eliminar contenido de favoritos
 *     security:
 *       - bearerAuth: []
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
 *         description: Contenido eliminado de favoritos
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Contenido no encontrado en favoritos
 *
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - externalId
 *         - mediaType
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
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
