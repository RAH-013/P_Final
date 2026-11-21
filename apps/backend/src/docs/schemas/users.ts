/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener información del usuario autenticado
 *     description: Devuelve el token JWT actual y el nombre de usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserMeResponse'
 *       401:
 *         description: No autenticado o token inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     tags:
 *       - Users
 *     summary: Eliminar cuenta propia
 *     description: Elimina la cuenta del usuario autenticado después de verificar su contraseña.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Cuenta eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Contraseña inválida
 *       401:
 *         description: Contraseña incorrecta o sesión inválida
 *       500:
 *         description: Error interno del servidor
 *
 * /users/me/username:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Actualizar nombre de usuario propio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 32
 *                 pattern: '^[a-zA-Z0-9_]{3,32}$'
 *                 example: nuevo_usuario
 *     responses:
 *       200:
 *         description: Nombre de usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Nombre de usuario inválido
 *       401:
 *         description: No autenticado
 *       409:
 *         description: Nombre de usuario ocupado
 *       500:
 *         description: Error interno del servidor
 *
 * /users/me/password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Actualizar contraseña propia
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Password123!
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Datos inválidos o contraseña nueva igual a la actual
 *       401:
 *         description: Contraseña actual incorrecta o sesión inválida
 *       500:
 *         description: Error interno del servidor
 *
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Eliminar cuenta de otro usuario (administrador)
 *     description: Permite al administrador eliminar cualquier cuenta excepto la propia.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador de la cuenta que se desea eliminar
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 15
 *     responses:
 *       200:
 *         description: Cuenta eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       400:
 *         description: Identificador inválido o intento de eliminar la propia cuenta
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 * /users/{id}/role:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cambiar rol de una cuenta (administrador)
 *     description: Permite al administrador cambiar el rol de otro usuario. No se permite modificar el propio rol.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador de la cuenta cuyo rol se desea cambiar
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 15
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       400:
 *         description: Rol inválido o intento de cambiar el propio rol
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: La cuenta ya tiene ese rol
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     SuccessResponse:
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
 *           example: Operación realizada correctamente
 *         data:
 *           type: object
 *           additionalProperties: true
 *
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - error
 *         - detalles
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Datos inválidos
 *         detalles:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *
 *     UserMeResponse:
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
 *           example: Información del usuario obtenida correctamente
 *         data:
 *           type: object
 *           required:
 *             - token
 *             - username
 *           properties:
 *             token:
 *               type: string
 *               description: Token JWT actual de la sesión
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             username:
 *               type: string
 *               example: usuario123
 *
 *     UserResponse:
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
 *           example: Nombre de usuario actualizado correctamente
 *         data:
 *           $ref: '#/components/schemas/User'
 *
 *     AdminUserResponse:
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
 *           example: Operación realizada correctamente
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Operación realizada correctamente
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 15
 *         username:
 *           type: string
 *           example: nuevo_usuario
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: user
 */
export {};
