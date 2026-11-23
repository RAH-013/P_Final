/**
 * @openapi
 * /api/likes:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Obtener los favoritos del usuario autenticado
 *     description: Devuelve las películas y series favoritas del usuario autenticado, ordenadas por fecha de creación descendente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoritos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikesResponse'
 *       401:
 *         description: No autenticado o sesión inválida
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *             $ref: '#/components/schemas/CreateLikeRequest'
 *           example:
 *             externalId: tt0111161
 *             mediaType: movie
 *     responses:
 *       201:
 *         description: Favorito creado o favorito existente devuelto correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *       400:
 *         description: Datos del favorito inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado o sesión inválida
 *       404:
 *         description: Usuario o película/serie no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflicto por registro duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Error al consultar el catálogo externo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *         description: Identificador interno del favorito.
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
 *               $ref: '#/components/schemas/LikeResponse'
 *       400:
 *         description: ID del favorito inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado o sesión inválida
 *       404:
 *         description: Favorito no encontrado o no pertenece al usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado o sesión inválida
 *       404:
 *         description: Contenido no encontrado en favoritos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * components:
 *   schemas:
 *     LikesResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Favoritos obtenidos correctamente
 *         data:
 *           type: object
 *           required:
 *             - likes
 *           properties:
 *             likes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Like'
 *
 *     LikeResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Contenido agregado a tus favoritos
 *         data:
 *           type: object
 *           required:
 *             - like
 *           properties:
 *             like:
 *               $ref: '#/components/schemas/Like'
 *
 *     CreateLikeRequest:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - externalId
 *         - mediaType
 *       properties:
 *         externalId:
 *           type: string
 *           pattern: '^tt\d+$'
 *           example: tt0111161
 *         mediaType:
 *           type: string
 *           enum:
 *             - movie
 *             - series
 *           example: movie
 *
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
 *           pattern: '^tt\d+$'
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
