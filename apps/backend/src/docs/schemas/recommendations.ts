/**
 * @openapi
 * /api/recommendations:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Obtener recomendaciones anteriores
 *     description: Devuelve las recomendaciones del usuario que no hayan sido marcadas como favoritas ni eliminadas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recomendaciones obtenidas correctamente
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
 *                   example: Recomendaciones obtenidas correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Debes configurar tus géneros preferidos antes de obtener recomendaciones
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *
 * /api/recommendations/next:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Obtener una nueva recomendación
 *     description: Genera y guarda una recomendación que no haya sido recomendada previamente ni marcada como favorita. Utiliza Gemini si está configurado y, en caso contrario, genera una recomendación estática.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Nueva recomendación generada correctamente
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
 *                   example: Nueva recomendación generada correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Debes configurar tus géneros preferidos antes de obtener recomendaciones
 *       401:
 *         description: No autenticado
 *       404:
 *         description: No hay más recomendaciones disponibles por el momento
 *       503:
 *         description: No fue posible generar una recomendación
 *
 * /api/recommendations/{id}:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Obtener una recomendación existente
 *     description: Recupera una recomendación previamente generada. Si fue creada mediante el método estático, puede intentar mejorarla utilizando Gemini cuando esté configurado.
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
 *         description: Recomendación obtenida correctamente
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
 *                   example: Recomendación obtenida correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Recommendation'
 *       400:
 *         description: Identificador de recomendación inválido o géneros preferidos no configurados
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Recomendación o título no encontrado
 *
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - externalId
 *         - mediaType
 *         - profileVersion
 *         - reason
 *         - source
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
 *           pattern: '^tt\d+$'
 *           example: tt0111161
 *         mediaType:
 *           type: string
 *           enum: [movie, series]
 *           example: movie
 *         profileVersion:
 *           type: integer
 *           example: 2
 *         reason:
 *           type: string
 *           example: Esta película coincide con tus preferencias de drama y crimen.
 *         score:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 0.92
 *         source:
 *           type: string
 *           enum: [gemini, fallback]
 *           example: gemini
 *         modelName:
 *           type: string
 *           nullable: true
 *           example: gemini-2.5-flash
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-11-21T18:30:00.000Z"
 *         item:
 *           type: object
 *           nullable: true
 *           description: Metadatos del título obtenidos desde Cinemeta.
 *           properties:
 *             id:
 *               type: string
 *               example: tt0111161
 *             type:
 *               type: string
 *               enum: [movie, series]
 *               example: movie
 *             title:
 *               type: string
 *               example: The Shawshank Redemption
 *             synopsis:
 *               type: string
 *               nullable: true
 *             poster:
 *               type: string
 *               nullable: true
 *             background:
 *               type: string
 *               nullable: true
 *             releaseDate:
 *               type: string
 *               nullable: true
 *             year:
 *               type: string
 *               nullable: true
 *             runtime:
 *               type: string
 *               nullable: true
 *             genres:
 *               type: array
 *               items:
 *                 type: string
 *             rating:
 *               type: number
 *               nullable: true
 *             votes:
 *               type: number
 *               nullable: true
 *             director:
 *               type: array
 *               items:
 *                 type: string
 *             cast:
 *               type: array
 *               items:
 *                 type: string
 *             country:
 *               type: string
 *               nullable: true
 *             language:
 *               type: string
 *               nullable: true
 */
export {};
