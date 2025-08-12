<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Documento;
use App\Models\Subfase_documento;
use App\Models\Fase_documento;
use App\Exceptions\ApiException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
* @OA\Tag(
*     name="Documento",
*     description="Operaciones relacionadas con los documentos del sistema de acreditación UMSS SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class DocumentoController extends BaseApiController
{
    /**
     * Crear un documento y asociarlo a una fase o subfase
     * @OA\Post (
     *     path="/api/documentos",
     *     tags={"Documento"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="nombre_documento", type="string", example="Manual de Procedimientos"),
     *                 @OA\Property(property="descripcion_documento", type="string", example="Descripción del documento"),
     *                 @OA\Property(property="archivo_documento", type="file", description="Archivo a subir"),
     *                 @OA\Property(property="tipo_documento", type="string", enum={"01", "02"}, example="01"),
     *                 @OA\Property(property="tipo_asociacion", type="string", enum={"fase", "subfase"}, example="fase"),
     *                 @OA\Property(property="fase_id", type="integer", example=1, description="ID de la fase (requerido si tipo_asociacion es 'fase')"),
     *                 @OA\Property(property="subfase_id", type="integer", example=1, description="ID de la subfase (requerido si tipo_asociacion es 'subfase')"),
     *                 @OA\Property(property="id_usuario_updated", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Documento creado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=201),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="documento", type="object"),
     *                 @OA\Property(property="asociacion", type="object"),
     *                 @OA\Property(property="tipo_asociacion", type="string", example="fase")
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error en la validación o subida del archivo",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=400),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="error", type="string", example="El archivo es requerido")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        // Si no se especifica tipo_asociacion, solo crear el documento
        if (!$request->has('tipo_asociacion')) {
            return $this->storeDocumentoSolo($request);
        }
        
        // Método original con asociación
        return $this->storeConAsociacion($request);
    }

    /**
     * Crear solo un documento sin asociación
     */
    public function storeDocumentoSolo(Request $request)
    {
        DB::beginTransaction();
        
        try {
            // Validación de datos para documento solo
            $validated = $request->validate([
                'nombre_documento' => 'required|string|max:255',
                'descripcion_documento' => 'nullable|string|max:1000',
                'archivo_documento' => 'required|file|max:20480|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif,zip,rar', // Max 20MB
                'tipo_documento' => 'nullable|string|in:01,02', // '01' para específicos, '02' para generales
                'id_usuario_updated' => 'nullable|integer',
            ]);

            // Procesar el archivo subido
            $archivo = $request->file('archivo_documento');
            $nombreOriginal = $archivo->getClientOriginalName();
            $tipoMime = $archivo->getClientMimeType();
            $tamanoArchivo = $archivo->getSize();

            // Leer el contenido del archivo
            $contenidoArchivo = file_get_contents($archivo->getRealPath());
            
            if ($contenidoArchivo === false) {
                throw new ApiException('Error al leer el contenido del archivo', 500);
            }

            // Crear el documento
            $documento = Documento::create([
                'nombre_documento' => $validated['nombre_documento'],
                'descripcion_documento' => $validated['descripcion_documento'] ?? null,
                'nombre_archivo_original' => $nombreOriginal,
                'tipo_mime' => $tipoMime,
                'contenido_archivo' => $contenidoArchivo,
                'tamano_archivo' => $tamanoArchivo,
                'tipo_documento' => $validated['tipo_documento'] ?? '02', // Por defecto general
                'id_usuario_updated_documento' => $validated['id_usuario_updated'] ?? null,
            ]);

            if (!$documento) {
                throw ApiException::creationFailed('documento');
            }

            DB::commit();

            return $this->successResponse($documento, 'Documento creado exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Método original para crear documento con asociación
     */
    public function storeConAsociacion(Request $request)
    {
        DB::beginTransaction();
        
        try {

            // Validación de datos
            $validated = $request->validate([
                'nombre_documento' => 'required|string|max:255',
                'descripcion_documento' => 'nullable|string|max:1000',
                'archivo_documento' => 'required|file|max:20480|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif,zip,rar', // Max 20MB
                'tipo_documento' => 'required|string|in:01,02', // '01' para específicos, '02' para generales
                'tipo_asociacion' => 'required|string|in:fase,subfase',
                'fase_id' => 'required_if:tipo_asociacion,fase|exists:fases,id',
                'subfase_id' => 'required_if:tipo_asociacion,subfase|exists:sub_fases,id',
                'id_usuario_updated' => 'nullable|integer',
            ]);

            // Procesar el archivo subido
            $archivo = $request->file('archivo_documento');
            $nombreOriginal = $archivo->getClientOriginalName();
            $extension = $archivo->getClientOriginalExtension();
            $tipoMime = $archivo->getClientMimeType();
            $tamanoArchivo = $archivo->getSize();

            // Leer el contenido del archivo
            $contenidoArchivo = file_get_contents($archivo->getRealPath());
            
            if ($contenidoArchivo === false) {
                throw new ApiException('Error al leer el contenido del archivo', 500);
            }

            // Crear el documento
            $documento = Documento::create([
                'nombre_documento' => $validated['nombre_documento'],
                'descripcion_documento' => $validated['descripcion_documento'] ?? null,
                'nombre_archivo_original' => $nombreOriginal,
                'tipo_mime' => $tipoMime,
                'contenido_archivo' => $contenidoArchivo, // Se codifica automáticamente en base64 en el modelo
                'tamano_archivo' => $tamanoArchivo,
                'tipo_documento' => $validated['tipo_documento'],
                'id_usuario_updated_documento' => $validated['id_usuario_updated'] ?? null,
            ]);

            if (!$documento) {
                throw ApiException::creationFailed('documento');
            }

            // Crear la asociación según el tipo
            $asociacion = null;
            $tipoAsociacion = $validated['tipo_asociacion'];

            if ($tipoAsociacion === 'fase') {
                $asociacion = Fase_documento::create([
                    'documento_id' => $documento->id,
                    'fase_id' => $validated['fase_id'],
                ]);
            } elseif ($tipoAsociacion === 'subfase') {
                $asociacion = Subfase_documento::create([
                    'documento_id' => $documento->id,
                    'subfase_id' => $validated['subfase_id'],
                ]);
            }

            if (!$asociacion) {
                // Si no se pudo crear la asociación, eliminar el documento
                $documento->delete();
                throw ApiException::creationFailed('asociación de documento');
            }

            DB::commit();

            // Agregar información adicional al documento para la respuesta
            $documento->tamano_formateado = $documento->tamano_formateado;

            return $this->successResponse([
                'documento' => $documento->load('fases', 'subfases'), // Cargar relaciones
                'asociacion' => $asociacion,
                'tipo_asociacion' => $tipoAsociacion,
                'archivo_info' => [
                    'nombre_original' => $nombreOriginal,
                    'tamano_bytes' => $tamanoArchivo,
                    'tamano_formateado' => $documento->tamano_formateado,
                    'tipo_mime' => $tipoMime,
                    'tiene_archivo' => $documento->archivoExiste()
                ]
            ], 'Documento y asociación creados exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener todos los documentos con sus asociaciones
     * @OA\Get (
     *     path="/api/documentos",
     *     tags={"Documento"},
     *     @OA\Response(
     *         response=200,
     *         description="Documentos obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nombre_documento", type="string", example="Manual de Procedimientos"),
     *                     @OA\Property(property="descripcion_documento", type="string", example="Descripción del documento"),
     *                     @OA\Property(property="fases", type="array", @OA\Items(type="object")),
     *                     @OA\Property(property="subfases", type="array", @OA\Items(type="object"))
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function index()
    {
        try {
            Log::info('Obteniendo todos los documentos');
            
            // Primero probar sin relaciones para ver si hay documentos
            $documentos = Documento::all();
            
            Log::info('Documentos encontrados (sin relaciones)', [
                'count' => $documentos->count(),
                'documentos' => $documentos->map(function($doc) {
                    return [
                        'id' => $doc->id,
                        'nombre' => $doc->nombre_documento,
                        'tipo' => $doc->tipo_documento,
                        'tipo_mime' => $doc->tipo_mime,
                        'nombre_archivo_original' => $doc->nombre_archivo_original,
                        'created_at' => $doc->created_at
                    ];
                })
            ]);

            if ($documentos->isEmpty()) {
                Log::info('No hay documentos en la base de datos');
                return $this->successResponse([], 'No hay documentos registrados', 200);
            }

            // Si hay documentos, intentar cargar con relaciones
            try {
                $documentosConRelaciones = Documento::with(['fases', 'subfases'])->get();
                Log::info('Documentos con relaciones cargados exitosamente');
                return $this->successResponse($documentosConRelaciones, 'Documentos obtenidos exitosamente');
            } catch (\Exception $relException) {
                Log::error('Error al cargar relaciones, devolviendo documentos sin relaciones', [
                    'error' => $relException->getMessage()
                ]);
                return $this->successResponse($documentos, 'Documentos obtenidos exitosamente (sin relaciones)');
            }

        } catch (\Exception $e) {
            Log::error('Error al obtener documentos', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener un documento específico con sus asociaciones
     * @OA\Get (
     *     path="/api/documentos/{id}",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documento encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nombre_documento", type="string", example="Manual de Procedimientos"),
     *                 @OA\Property(property="descripcion_documento", type="string", example="Descripción del documento"),
     *                 @OA\Property(property="fases", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="subfases", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $documento = Documento::with(['fases', 'subfases'])->find($id);

            if (!$documento) {
                throw ApiException::notFound('documento', $id);
            }

            return $this->successResponse($documento, 'Documento encontrado');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener documentos por fase
     * @OA\Get (
     *     path="/api/fases/{faseId}/documentos",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="faseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la fase"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documentos de la fase obtenidos exitosamente"
     *     )
     * )
     */
    public function getDocumentosByFase($faseId)
    {
        try {
            $documentos = Documento::whereHas('fases', function($query) use ($faseId) {
                $query->where('fase_id', $faseId);
            })->with(['fases' => function($query) use ($faseId) {
                $query->where('fase_id', $faseId);
            }])->get();

            return $this->successResponse($documentos, 'Documentos de la fase obtenidos exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener documentos por subfase
     * @OA\Get (
     *     path="/api/subfases/{subfaseId}/documentos",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="subfaseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la subfase"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documentos de la subfase obtenidos exitosamente"
     *     )
     * )
     */
    public function getDocumentosBySubfase($subfaseId)
    {
        try {
            $documentos = Documento::whereHas('subfases', function($query) use ($subfaseId) {
                $query->where('subfase_id', $subfaseId);
            })->with(['subfases' => function($query) use ($subfaseId) {
                $query->where('subfase_id', $subfaseId);
            }])->get();

            return $this->successResponse($documentos, 'Documentos de la subfase obtenidos exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }


    /**
     * Eliminar un documento
     * @OA\Delete (
     *     path="/api/documentos/{id}",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documento eliminado exitosamente"
     *     )
     * )
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        
        try {
            $documento = Documento::find($id);

            if (!$documento) {
                throw ApiException::notFound('documento', $id);
            }

            // Eliminar primero las asociaciones
            Fase_documento::where('documento_id', $id)->delete();
            Subfase_documento::where('documento_id', $id)->delete();

            // Eliminar el documento (el archivo se elimina automáticamente al eliminar el registro)
            $deleted = $documento->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('documento');
            }

            DB::commit();

            return $this->successResponse(null, 'Documento eliminado exitosamente', 200);

        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Debug: Ver información del documento (temporal)
     */
    public function debug($id)
    {
        try {
            $documento = Documento::find($id);

            if (!$documento) {
                throw ApiException::notFound('documento', $id);
            }

            return $this->successResponse([
                'id' => $documento->id,
                'nombre_documento' => $documento->nombre_documento,
                'nombre_archivo_original' => $documento->nombre_archivo_original,
                'tipo_mime' => $documento->tipo_mime,
                'tamano_archivo' => $documento->tamano_archivo,
                'tipo_documento' => $documento->tipo_documento,
                'archivo_existe' => $documento->archivoExiste(),
                'created_at' => $documento->created_at,
            ], 'Información del documento obtenida');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Visualizar un documento en el navegador
     * @OA\Get (
     *     path="/api/documentos/{id}/ver",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documento visualizado exitosamente"
     *     )
     * )
     */
    public function ver($id)
    {
        try {
            $documento = Documento::find($id);

            if (!$documento) {
                throw ApiException::notFound('documento', $id);
            }

            if (!$documento->archivoExiste()) {
                throw new ApiException('El archivo no existe en la base de datos', 404);
            }

            // Obtener el contenido del archivo
            $contenidoArchivo = $documento->getContenidoArchivo();
            
            if (!$contenidoArchivo) {
                throw new ApiException('Error al recuperar el contenido del archivo', 500);
            }

            // Configurar headers para visualización en el navegador (inline)
            $headers = [
                'Content-Type' => $documento->tipo_mime ?: 'application/pdf',
                'Content-Length' => $documento->tamano_archivo,
                'Content-Disposition' => 'inline',  // Sin filename para evitar sugerencia de descarga
                'Cache-Control' => 'public, max-age=3600',
                'Pragma' => 'public',
                'X-Content-Type-Options' => 'nosniff',
                'X-Frame-Options' => 'SAMEORIGIN',  // Permitir iframe si es necesario
            ];

            return response($contenidoArchivo, 200, $headers);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Descargar un documento
     * @OA\Get (
     *     path="/api/documentos/{id}/descargar",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Archivo descargado exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/octet-stream",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Documento no encontrado o archivo no existe"
     *     )
     * )
     */
    public function descargar($id)
    {
        try {
            $documento = Documento::find($id);

            if (!$documento) {
                throw ApiException::notFound('documento', $id);
            }

            if (!$documento->archivoExiste()) {
                throw new ApiException('El archivo no existe en la base de datos', 404);
            }

            // Obtener el contenido del archivo
            $contenidoArchivo = $documento->getContenidoArchivo();
            
            if (!$contenidoArchivo) {
                throw new ApiException('Error al recuperar el contenido del archivo', 500);
            }

            // Configurar headers para la descarga
            $headers = [
                'Content-Type' => $documento->tipo_mime,
                'Content-Length' => $documento->tamano_archivo,
                'Content-Disposition' => 'attachment; filename="' . $documento->nombre_archivo_original . '"',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Pragma' => 'public',
            ];

            return response($contenidoArchivo, 200, $headers);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Asociar un documento existente a una fase
     * @OA\Post(
     *     path="/api/fases/{faseId}/documentos",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="faseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la fase"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="documento_id", type="integer", example=1, description="ID del documento a asociar")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Documento asociado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=201),
     *             @OA\Property(property="datos", type="object"),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error en la validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=400),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="error", type="string", example="El documento ya está asociado a esta fase")
     *         )
     *     )
     * )
     */
    public function asociarDocumentoAFase(Request $request, $faseId)
    {
        DB::beginTransaction();
        
        try {
            // Validación
            $validated = $request->validate([
                'documento_id' => 'required|integer|exists:documentos,id'
            ]);

            $documentoId = $validated['documento_id'];

            // Verificar que la fase existe
            $faseExists = DB::table('fases')->where('id', $faseId)->exists();
            if (!$faseExists) {
                throw new ApiException('La fase especificada no existe', 404);
            }

            // Verificar si ya existe la asociación
            $existeAsociacion = Fase_documento::where('fase_id', $faseId)
                ->where('documento_id', $documentoId)
                ->exists();

            if ($existeAsociacion) {
                throw new ApiException('El documento ya está asociado a esta fase', 400);
            }

            // Crear la asociación usando el modelo
            $asociacion = Fase_documento::create([
                'fase_id' => $faseId,
                'documento_id' => $documentoId,
            ]);

            if (!$asociacion) {
                throw new ApiException('Error al asociar el documento a la fase', 500);
            }

            DB::commit();

            return $this->successResponse([
                'fase_id' => $faseId,
                'documento_id' => $documentoId,
                'asociacion' => $asociacion,
                'mensaje' => 'Documento asociado exitosamente a la fase'
            ], 'Documento asociado exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            DB::rollBack();
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Asociar un documento existente a una subfase
     * @OA\Post(
     *     path="/api/subfases/{subfaseId}/documentos",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="subfaseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la subfase"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="documento_id", type="integer", example=1, description="ID del documento a asociar")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Documento asociado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=201),
     *             @OA\Property(property="datos", type="object"),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error en la validación",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=400),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="error", type="string", example="El documento ya está asociado a esta subfase")
     *         )
     *     )
     * )
     */
    public function asociarDocumentoASubfase(Request $request, $subfaseId)
    {
        DB::beginTransaction();
        
        try {
            Log::info('Asociando documento a subfase', [
                'subfase_id' => $subfaseId,
                'request_data' => $request->all()
            ]);

            // Validación
            $validated = $request->validate([
                'documento_id' => 'required|integer|exists:documentos,id'
            ]);

            $documentoId = $validated['documento_id'];
            
            Log::info('Datos validados', [
                'documento_id' => $documentoId,
                'subfase_id' => $subfaseId
            ]);

            // Verificar que la subfase existe
            $subfaseExists = DB::table('sub_fases')->where('id', $subfaseId)->exists();
            if (!$subfaseExists) {
                Log::error('Subfase no encontrada', ['subfase_id' => $subfaseId]);
                throw new ApiException('La subfase especificada no existe', 404);
            }

            // Verificar si ya existe la asociación
            $existeAsociacion = Subfase_documento::where('subfase_id', $subfaseId)
                ->where('documento_id', $documentoId)
                ->exists();

            if ($existeAsociacion) {
                Log::warning('Asociación ya existe', [
                    'subfase_id' => $subfaseId,
                    'documento_id' => $documentoId
                ]);
                throw new ApiException('El documento ya está asociado a esta subfase', 400);
            }

            // Crear la asociación usando el modelo
            $asociacion = Subfase_documento::create([
                'subfase_id' => $subfaseId,
                'documento_id' => $documentoId,
            ]);

            if (!$asociacion) {
                Log::error('Error al crear asociación');
                throw new ApiException('Error al asociar el documento a la subfase', 500);
            }

            Log::info('Asociación creada exitosamente', [
                'asociacion_id' => $asociacion->id
            ]);

            DB::commit();

            return $this->successResponse([
                'subfase_id' => $subfaseId,
                'documento_id' => $documentoId,
                'asociacion' => $asociacion,
                'mensaje' => 'Documento asociado exitosamente a la subfase'
            ], 'Documento asociado exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Error de validación', ['errors' => $e->errors()]);
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            DB::rollBack();
            Log::error('Error de API', ['message' => $e->getMessage()]);
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error general', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener asociaciones de un documento específico
     * @OA\Get (
     *     path="/api/documentos/{id}/asociaciones",
     *     tags={"Documento"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Asociaciones del documento obtenidas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(
     *                     property="fases",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="nombre_fase", type="string"),
     *                         @OA\Property(property="descripcion_fase", type="string"),
     *                         @OA\Property(property="fecha_inicio_fase", type="string"),
     *                         @OA\Property(property="fecha_fin_fase", type="string"),
     *                         @OA\Property(property="carrera_modalidad_id", type="integer"),
     *                         @OA\Property(property="estado", type="string")
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="subfases",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="nombre_subfase", type="string"),
     *                         @OA\Property(property="descripcion_subfase", type="string"),
     *                         @OA\Property(property="fecha_inicio_subfase", type="string"),
     *                         @OA\Property(property="fecha_fin_subfase", type="string"),
     *                         @OA\Property(property="fase_id", type="integer"),
     *                         @OA\Property(property="estado", type="string"),
     *                         @OA\Property(
     *                             property="fase",
     *                             type="object",
     *                             @OA\Property(property="id", type="integer"),
     *                             @OA\Property(property="nombre_fase", type="string")
     *                         )
     *                     )
     *                 )
     *             ),
     *             @OA\Property(property="mensaje", type="string", example="Asociaciones obtenidas exitosamente"),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Documento no encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=404),
     *             @OA\Property(property="datos", type="object", nullable=true),
     *             @OA\Property(property="error", type="string", example="Documento no encontrado")
     *         )
     *     )
     * )
     */
    public function getAsociaciones($id)
    {
        try {
            Log::info('Obteniendo asociaciones del documento', ['documento_id' => $id]);
            
            // Verificar que el documento existe
            $documento = Documento::find($id);
            if (!$documento) {
                throw ApiException::notFound('documento', $id);
            }

            // Obtener fases asociadas con información completa
            $fases = $documento->fases()->get();
            
            // Obtener subfases asociadas con información completa y la fase padre
            $subfases = $documento->subfases()->with('fase:id,nombre_fase')->get();

            Log::info('Asociaciones encontradas', [
                'documento_id' => $id,
                'fases_count' => $fases->count(),
                'subfases_count' => $subfases->count(),
                'fases' => $fases->map(function($fase) {
                    return [
                        'id' => $fase->id,
                        'nombre' => $fase->nombre_fase,
                        'carrera_modalidad_id' => $fase->carrera_modalidad_id
                    ];
                }),
                'subfases' => $subfases->map(function($subfase) {
                    return [
                        'id' => $subfase->id,
                        'nombre' => $subfase->nombre_subfase,
                        'fase_id' => $subfase->fase_id,
                        'fase_nombre' => $subfase->fase ? $subfase->fase->nombre_fase : 'N/A'
                    ];
                })
            ]);

            $asociaciones = [
                'fases' => $fases,
                'subfases' => $subfases
            ];

            return $this->successResponse($asociaciones, 'Asociaciones obtenidas exitosamente');

        } catch (ApiException $e) {
            Log::error('Error de API al obtener asociaciones', [
                'documento_id' => $id,
                'message' => $e->getMessage()
            ]);
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            Log::error('Error general al obtener asociaciones', [
                'documento_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->handleGeneralException($e);
        }
    }
}
