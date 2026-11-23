/**
 * @openapi
 * /api/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Obtener todos los comentarios
 *     description: Devuelve todos los comentarios registrados, incluyendo información básica de sus autores. No requiere autenticación.
 *     responses:
 *       200:
 *         description: Comentarios obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - comments
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   post:
 *     tags:
 *       - Comments
 *     summary: Publicar un comentario
 *     description: Publica un comentario asociado a una película o serie existente. El usuario se obtiene del token de autenticación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *           example:
 *             externalId: tt0111161
 *             mediaType: movie
 *             content: Una excelente película, muy recomendable.
 *     responses:
 *       201:
 *         description: Comentario publicado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - message
 *                 - comment
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 12
 *                 message:
 *                   type: string
 *                   example: Comentario publicado
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Datos inválidos o comentario vacío
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: Película, serie o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Error al consultar el catálogo externo
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/comments/user/{userId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Obtener comentarios de un usuario
 *     description: Devuelve todos los comentarios publicados por un usuario específico, incluyendo información básica de su autor y ordenados del más reciente al más antiguo. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Identificador interno del usuario.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 3
 *     responses:
 *       200:
 *         description: Comentarios del usuario obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - comments
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/comments/{mediaType}/{externalId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Obtener comentarios de una película o serie
 *     description: Devuelve los comentarios asociados a un contenido específico, ordenados del más reciente al más antiguo. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: mediaType
 *         required: true
 *         description: Tipo de contenido.
 *         schema:
 *           type: string
 *           enum:
 *             - movie
 *             - series
 *         example: movie
 *       - in: path
 *         name: externalId
 *         required: true
 *         description: Identificador externo del contenido.
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
 *               required:
 *                 - comments
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Tipo o identificador de contenido inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/comments/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Obtener un comentario por su ID
 *     description: Devuelve un comentario específico junto con la información básica de su autor. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador interno del comentario.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     responses:
 *       200:
 *         description: Comentario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - comment
 *               properties:
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: ID de comentario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Comentario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Actualizar un comentario propio
 *     description: Permite al autor modificar el contenido de su comentario. No permite modificar comentarios de otros usuarios.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador interno del comentario.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *           example:
 *             content: Comentario actualizado.
 *     responses:
 *       200:
 *         description: Comentario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - comment
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comentario actualizado
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: ID o contenido inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token ausente, inválido o expirado
 *       403:
 *         description: El usuario no es propietario del comentario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Comentario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Eliminar un comentario
 *     description: El autor puede eliminar su propio comentario. Los administradores pueden eliminar cualquier comentario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador interno del comentario.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 12
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comentario eliminado
 *       400:
 *         description: ID de comentario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token ausente, inválido o expirado
 *       403:
 *         description: El usuario no tiene permiso para eliminar este comentario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Comentario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * components:
 *   schemas:
 *     CreateCommentRequest:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - externalId
 *         - mediaType
 *         - content
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
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: Una excelente película, muy recomendable.
 *
 *     UpdateCommentRequest:
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: Comentario actualizado.
 *
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
 *         - user
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         userId:
 *           type: integer
 *           example: 3
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
 *         content:
 *           type: string
 *           maxLength: 1000
 *           example: Una excelente película, muy recomendable.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 *         user:
 *           type: object
 *           required:
 *             - id
 *             - username
 *           properties:
 *             id:
 *               type: integer
 *               example: 3
 *             username:
 *               type: string
 *               example: usuario
 *
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           example: Comentario no encontrado
 *         detalles:
 *           type: array
 *           items:
 *             type: object
 *           description: Detalles de validación, cuando corresponda.
 *
 *   responses:
 *     InternalServerError:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */
export {};
