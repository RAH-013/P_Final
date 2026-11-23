/**
 * @openapi
 * /api/genres:
 *   get:
 *     tags:
 *       - Genres
 *     summary: Obtener géneros disponibles
 *     description: Obtiene los géneros presentes en los catálogos de películas y series de Cinemeta.
 *     responses:
 *       200:
 *         description: Géneros disponibles obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 genres:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - Action
 *                     - Adventure
 *                     - Comedy
 *                     - Crime
 *                     - Drama
 *                     - Thriller
 *                 total:
 *                   type: integer
 *                   example: 6
 *       502:
 *         description: Error al consultar Cinemeta
 *
 * /api/genres/me:
 *   get:
 *     tags:
 *       - Genres
 *     summary: Obtener géneros preferidos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias obtenidas correctamente
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
 *                   example: Géneros obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - action
 *                     - comedy
 *                     - thriller
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *
 *   put:
 *     tags:
 *       - Genres
 *     summary: Actualizar géneros preferidos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - genres
 *             properties:
 *               genres:
 *                 type: array
 *                 maxItems: 10
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   maxLength: 64
 *                 example:
 *                   - action
 *                   - comedy
 *                   - thriller
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente
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
 *                   example: Géneros actualizados correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - action
 *                     - comedy
 *                     - thriller
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *       422:
 *         description: Los géneros proporcionados no cumplen con las reglas de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - error
 *                 - detalles
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Los géneros proporcionados no son válidos
 *                 detalles:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example:
 *                     - code: too_big
 *                       message: Array must contain at most 10 element(s)
 *                       path:
 *                         - genres
 */
export {};
