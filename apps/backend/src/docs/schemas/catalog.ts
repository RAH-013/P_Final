/**
 * @openapi
 * /api/catalog/search:
 *   get:
 *     tags:
 *       - Catalog
 *     summary: Buscar películas o series
 *     description: Busca películas y series por prefijo del nombre. Cada resultado indica su tipo de contenido. Si no encuentra coincidencias, devuelve hasta 20 títulos destacados como sugerencias.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         example: interestelar
 *     responses:
 *       200:
 *         description: Búsqueda realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CatalogSearchResponse'
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *       502:
 *         description: Error al consultar Cinemeta
 *
 * /api/catalog/featured:
 *   get:
 *     tags:
 *       - Catalog
 *     summary: Obtener contenido destacado
 *     description: Obtiene hasta 10 películas, 10 series o los 10 títulos mejor calificados entre ambos tipos.
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, movie, series]
 *           default: all
 *         example: movie
 *     responses:
 *       200:
 *         description: Contenido destacado obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CatalogResultResponse'
 *       400:
 *         description: Parámetros inválidos
 *       502:
 *         description: Error al consultar Cinemeta
 *
 * /api/catalog/{id}:
 *   get:
 *     tags:
 *       - Catalog
 *     summary: Obtener detalles de una película o serie
 *     description: Obtiene los metadatos disponibles de un título mediante su identificador de IMDb y el tipo de contenido indicado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^tt\d+$'
 *         example: tt0816692
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [movie, series]
 *         example: movie
 *     responses:
 *       200:
 *         description: Detalles obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CatalogItemResponse'
 *       400:
 *         description: Identificador o tipo de contenido inválido
 *       404:
 *         description: Contenido no encontrado
 *       502:
 *         description: Error al consultar Cinemeta
 *
 * components:
 *   schemas:
 *     CatalogSearchResponse:
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
 *           example: Resultados obtenidos correctamente
 *         data:
 *           $ref: '#/components/schemas/CatalogSearchResult'
 *
 *     CatalogSearchResult:
 *       type: object
 *       required:
 *         - matches
 *         - suggestions
 *       properties:
 *         matches:
 *           type: array
 *           description: Coincidencias por prefijo encontradas entre películas y series.
 *           items:
 *             $ref: '#/components/schemas/SearchSuggestion'
 *         suggestions:
 *           type: array
 *           description: Hasta 20 títulos destacados cuando no existen coincidencias.
 *           maxItems: 20
 *           items:
 *             $ref: '#/components/schemas/SearchFallback'
 *
 *     SearchSuggestion:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - type
 *         - year
 *         - country
 *       properties:
 *         id:
 *           type: string
 *           example: tt0816692
 *         title:
 *           type: string
 *           example: Interstellar
 *         type:
 *           type: string
 *           enum: [movie, series]
 *           example: movie
 *         year:
 *           type: integer
 *           nullable: true
 *           example: 2014
 *         country:
 *           type: string
 *           nullable: true
 *           example: United States
 *
 *     SearchFallback:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - poster
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           example: tt0816692
 *         title:
 *           type: string
 *           example: Interstellar
 *         poster:
 *           type: string
 *           nullable: true
 *           format: uri
 *           example: https://images.example.com/poster.jpg
 *         type:
 *           type: string
 *           enum: [movie, series]
 *           example: movie
 *
 *     CatalogResultResponse:
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
 *           example: Contenido destacado obtenido correctamente
 *         data:
 *           $ref: '#/components/schemas/CatalogResult'
 *
 *     CatalogResult:
 *       type: object
 *       required:
 *         - items
 *         - total
 *         - type
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CatalogItem'
 *         total:
 *           type: integer
 *           example: 10
 *         type:
 *           type: string
 *           enum: [movie, series, all]
 *           example: movie
 *
 *     CatalogItemResponse:
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
 *           example: Detalles obtenidos correctamente
 *         data:
 *           $ref: '#/components/schemas/CatalogItem'
 *
 *     CatalogItem:
 *       type: object
 *       required:
 *         - id
 *         - type
 *         - title
 *         - synopsis
 *         - poster
 *         - background
 *         - releaseDate
 *         - year
 *         - runtime
 *         - genres
 *         - rating
 *         - votes
 *         - director
 *         - cast
 *         - country
 *         - language
 *       properties:
 *         id:
 *           type: string
 *           description: Identificador único de IMDb.
 *           example: tt0816692
 *         type:
 *           type: string
 *           enum: [movie, series]
 *           example: movie
 *         title:
 *           type: string
 *           example: Interstellar
 *         synopsis:
 *           type: string
 *           nullable: true
 *           example: Un equipo de exploradores viaja más allá de esta galaxia.
 *         poster:
 *           type: string
 *           nullable: true
 *           format: uri
 *           example: https://images.example.com/poster.jpg
 *         background:
 *           type: string
 *           nullable: true
 *           format: uri
 *           example: https://images.example.com/background.jpg
 *         releaseDate:
 *           type: string
 *           nullable: true
 *           example: "2014-11-07"
 *         year:
 *           type: integer
 *           nullable: true
 *           example: 2014
 *         runtime:
 *           type: string
 *           nullable: true
 *           example: "169 min"
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - Adventure
 *             - Drama
 *             - Sci-Fi
 *         rating:
 *           type: number
 *           nullable: true
 *           description: Puntuación de IMDb.
 *           example: 8.7
 *         votes:
 *           type: integer
 *           nullable: true
 *           description: Número de votos de IMDb.
 *           example: 2400000
 *         director:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - Christopher Nolan
 *         cast:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - Matthew McConaughey
 *         country:
 *           type: string
 *           nullable: true
 *           example: United States
 *         language:
 *           type: string
 *           nullable: true
 *           example: English
 */
export {};
