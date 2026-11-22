/**
 * @openapi
 * /api/likes:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Obtener los favoritos del usuario autenticado
 *     description: Devuelve las películas y series que pertenecen al usuario autenticado, ordenadas por fecha de creación descendente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoritos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - likes
 *               properties:
 *                 likes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Like'
 *       400:
 *         description: El ID del usuario no es válido
 *       401:
 *         description: No autenticado o sesión inválida
 *
 *   post:
 *     tags:
 *       - Likes
 *     summary: Agregar una película o serie a favoritos
 *     description: Registra un contenido en los favoritos del usuario autenticado. Si ya existe, devuelve el favorito existente.
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
 *                 enum:
 *                   - movie
 *                   - series
 *                 example: movie
 *     responses:
 *       201:
 *         description: Favorito creado o favorito existente devuelto correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - like
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contenido agregado a tus favoritos
 *                 like:
 *                   $ref: '#/components/schemas/Like'
 *       400:
 *         description: Datos del favorito o ID del usuario inválidos
 *       401:
 *         description: No autenticado o sesión inválida
 *       404:
 *         description: Usuario o película/serie no encontrada
 *       409:
 *         description: Conflicto por registro duplicado
 *
 * /api/likes/{id}:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Obtener un favorito por su ID
 *     description: Devuelve un favorito únicamente si pertenece al usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del favorito
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 5
 *     responses:
 *       200:
 *         description: Favorito obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - like
 *               properties:
 *                 like:
 *                   $ref: '#/components/schemas/Like'
 *       400:
 *         description: ID del favorito inválido
 *       401:
 *         description: No autenticado o sesión inválida
 *       404:
 *         description: Favorito no encontrado o no pertenece al usuario autenticado
 *
 * /api/likes/{mediaType}/{externalId}:
 *   delete:
 *     tags:
 *       - Likes
 *     summary: Eliminar un contenido de favoritos
 *     description: Elimina un favorito perteneciente al usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - movie
 *             - series
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
 *         description: Favorito eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contenido eliminado de tus favoritos
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autenticado o sesión inválida
 *       404:
 *         description: Usuario o contenido no encontrado en favoritos
 *
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - id
 *         - externalId
 *         - mediaType
 *         - createdAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         externalId:
 *           type: string
 *           example: tt0111161
 *         mediaType:
 *           type: string
 *           enum:
 *             - movie
 *             - series
 *           example: movie
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 */
export {};
