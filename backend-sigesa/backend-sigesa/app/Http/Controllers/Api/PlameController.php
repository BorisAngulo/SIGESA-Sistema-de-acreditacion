<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plame;
use App\Models\CarreraModalidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use App\Exceptions\ApiException;
use App\Traits\ApiResponseTrait;

class PlameController extends BaseApiController
{
    use ApiResponseTrait;

    /**
     * @OA\Get(
     *     path="/api/plame/carrera-modalidad/{carreraModalidadId}",
     *     summary="Obtener documento PLAME por carrera-modalidad",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="carreraModalidadId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la carrera-modalidad"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documento PLAME obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="mensaje", type="string", example="Documento PLAME obtenido exitosamente"),
     *             @OA\Property(property="datos", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="nombre_documento", type="string"),
     *                 @OA\Property(property="descripcion_documento", type="string"),
     *                 @OA\Property(property="nombre_archivo_original", type="string"),
     *                 @OA\Property(property="tipo_mime", type="string"),
     *                 @OA\Property(property="tamano_archivo", type="integer"),
     *                 @OA\Property(property="tipo_documento", type="string"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="No se encontró documento PLAME"),
     *     @OA\Response(response=401, description="No autorizado")
     * )
     */
    public function getPlameByCarreraModalidad($carreraModalidadId)
    {
        try {
            $carreraModalidad = CarreraModalidad::with(['carrera', 'modalidad'])->find($carreraModalidadId);
            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $carreraModalidadId);
            }

            $plame = Plame::where('id_carreraModalidad', $carreraModalidadId)->first();

            if (!$plame) {
                return $this->successResponse(null, 'No existe documento PLAME para esta carrera-modalidad');
            }

            // No incluir el contenido del archivo en la respuesta por defecto
            $plameData = $plame->makeHidden(['contenido_archivo'])->toArray();

            return $this->successResponse([
                'plame' => $plameData,
                'carreraModalidad' => [
                    'id' => $carreraModalidad->id,
                    'carrera' => $carreraModalidad->carrera?->nombre,
                    'modalidad' => $carreraModalidad->modalidad?->nombre
                ]
            ], 'Documento PLAME obtenido exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/plame",
     *     summary="Subir documento PLAME",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="id_carreraModalidad", type="integer", description="ID de carrera-modalidad"),
     *                 @OA\Property(property="nombre_documento", type="string", description="Nombre del documento"),
     *                 @OA\Property(property="descripcion_documento", type="string", description="Descripción del documento"),
     *                 @OA\Property(property="tipo_documento", type="string", description="Tipo de documento PLAME"),
     *                 @OA\Property(property="archivo", type="string", format="binary", description="Archivo a subir")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Documento PLAME subido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="mensaje", type="string"),
     *             @OA\Property(property="datos", type="object")
     *         )
     *     )
     * )
     */
    public function subirPlame(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_carreraModalidad' => 'required|exists:carrera_modalidades,id',
                'nombre_documento' => 'required|string|max:255',
                'archivo' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240' // 10MB max
            ]);

            // Verificar si ya existe un PLAME para esta carrera-modalidad
            $plameExistente = Plame::where('id_carreraModalidad', $validated['id_carreraModalidad'])->first();
            
            if ($plameExistente) {
                return $this->errorResponse('Ya existe un documento PLAME para esta carrera-modalidad', 409);
            }

            $archivo = $request->file('archivo');
            
            DB::beginTransaction();

            $plame = Plame::create([
                'id_carreraModalidad' => $validated['id_carreraModalidad'],
                'nombre_documento' => $validated['nombre_documento'],
                'nombre_archivo_original' => $archivo->getClientOriginalName(),
                'tipo_mime' => $archivo->getMimeType(),
                'contenido_archivo' => base64_encode(file_get_contents($archivo->getPathname())),
                'tamano_archivo' => $archivo->getSize()
            ]);

            DB::commit();

            return $this->successResponse(
                $plame->makeHidden(['contenido_archivo']),
                'Documento PLAME subido exitosamente',
                201
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/plame/{id}",
     *     summary="Actualizar documento PLAME",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento PLAME"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="nombre_documento", type="string"),
     *                 @OA\Property(property="descripcion_documento", type="string"),
     *                 @OA\Property(property="tipo_documento", type="string"),
     *                 @OA\Property(property="archivo", type="string", format="binary", description="Nuevo archivo (opcional)")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Documento PLAME actualizado exitosamente")
     * )
     */
    public function actualizarPlame(Request $request, $id)
    {
        try {
            $plame = Plame::find($id);
            if (!$plame) {
                throw ApiException::notFound('documento PLAME', $id);
            }

            $validated = $request->validate([
                'nombre_documento' => 'sometimes|string|max:255',
                'archivo' => 'sometimes|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240'
            ]);

            DB::beginTransaction();

            // Actualizar campos de texto
            if (isset($validated['nombre_documento'])) {
                $plame->nombre_documento = $validated['nombre_documento'];
            }
            if (array_key_exists('descripcion_documento', $validated)) {
                $plame->descripcion_documento = $validated['descripcion_documento'];
            }
            if (isset($validated['tipo_documento'])) {
                $plame->tipo_documento = $validated['tipo_documento'];
            }

            // Si se proporciona un nuevo archivo, actualizarlo
            if ($request->hasFile('archivo')) {
                $archivo = $request->file('archivo');
                $plame->nombre_archivo_original = $archivo->getClientOriginalName();
                $plame->tipo_mime = $archivo->getMimeType();
                $plame->contenido_archivo = base64_encode(file_get_contents($archivo->getPathname()));
                $plame->tamano_archivo = $archivo->getSize();
            }

            $plame->save();

            DB::commit();

            return $this->successResponse(
                $plame->makeHidden(['contenido_archivo']),
                'Documento PLAME actualizado exitosamente'
            );

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/plame/{id}/descargar",
     *     summary="Descargar documento PLAME",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento PLAME"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Archivo descargado exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/octet-stream"
     *         )
     *     ),
     *     @OA\Response(response=404, description="Documento no encontrado")
     * )
     */
    public function descargarPlame($id)
    {
        try {
            $plame = Plame::find($id);
            if (!$plame) {
                throw ApiException::notFound('documento PLAME', $id);
            }

            if (!$plame->contenido_archivo) {
                return $this->errorResponse('El documento no tiene contenido disponible', 404);
            }

            $contenido = base64_decode($plame->contenido_archivo);

            return Response::make($contenido, 200, [
                'Content-Type' => $plame->tipo_mime,
                'Content-Disposition' => 'attachment; filename="' . $plame->nombre_archivo_original . '"',
                'Content-Length' => strlen($contenido),
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ]);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/plame/{id}/visualizar",
     *     summary="Visualizar documento PLAME en el navegador",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento PLAME"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Archivo mostrado en el navegador",
     *         @OA\MediaType(
     *             mediaType="application/pdf"
     *         )
     *     )
     * )
     */
    public function visualizarPlame($id)
    {
        try {
            $plame = Plame::find($id);
            if (!$plame) {
                throw ApiException::notFound('documento PLAME', $id);
            }

            if (!$plame->contenido_archivo) {
                return $this->errorResponse('El documento no tiene contenido disponible', 404);
            }

            $contenido = base64_decode($plame->contenido_archivo);

            return Response::make($contenido, 200, [
                'Content-Type' => $plame->tipo_mime,
                'Content-Disposition' => 'inline; filename="' . $plame->nombre_archivo_original . '"',
                'Content-Length' => strlen($contenido),
                'Cache-Control' => 'public, max-age=3600',
                'X-Frame-Options' => 'SAMEORIGIN'
            ]);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/plame/{id}",
     *     summary="Eliminar documento PLAME",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento PLAME"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documento PLAME eliminado exitosamente"
     *     )
     * )
     */
    public function eliminarPlame($id)
    {
        try {
            $plame = Plame::find($id);
            if (!$plame) {
                throw ApiException::notFound('documento PLAME', $id);
            }

            DB::beginTransaction();

            $plame->delete();

            DB::commit();

            return $this->successResponse(null, 'Documento PLAME eliminado exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/plame",
     *     summary="Listar todos los documentos PLAME",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="carrera_modalidad_id",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="integer"),
     *         description="Filtrar por carrera-modalidad"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de documentos PLAME obtenida exitosamente"
     *     )
     * )
     */
    public function listarPlames(Request $request)
    {
        try {
            $query = Plame::with(['carreraModalidad.carrera', 'carreraModalidad.modalidad']);

            // Filtro opcional por carrera-modalidad
            if ($request->has('carrera_modalidad_id')) {
                $query->where('id_carreraModalidad', $request->carrera_modalidad_id);
            }

            $plames = $query->get()->map(function ($plame) {
                return $plame->makeHidden(['contenido_archivo']);
            });

            return $this->successResponse($plames, 'Documentos PLAME obtenidos exitosamente');

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/plame/{id}/info",
     *     summary="Obtener información detallada del documento PLAME",
     *     tags={"PLAME"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID del documento PLAME"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información del documento obtenida exitosamente"
     *     )
     * )
     */
    public function obtenerInfoPlame($id)
    {
        try {
            $plame = Plame::with(['carreraModalidad.carrera', 'carreraModalidad.modalidad'])->find($id);
            
            if (!$plame) {
                throw ApiException::notFound('documento PLAME', $id);
            }

            $info = [
                'id' => $plame->id,
                'nombre_documento' => $plame->nombre_documento,
                'descripcion_documento' => $plame->descripcion_documento,
                'nombre_archivo_original' => $plame->nombre_archivo_original,
                'tipo_mime' => $plame->tipo_mime,
                'tamano_archivo' => $plame->tamano_archivo,
                'tamano_archivo_legible' => $this->formatearTamanoArchivo($plame->tamano_archivo),
                'tipo_documento' => $plame->tipo_documento,
                'created_at' => $plame->created_at,
                'updated_at' => $plame->updated_at,
                'carrera_modalidad' => [
                    'id' => $plame->carreraModalidad->id,
                    'carrera' => $plame->carreraModalidad->carrera?->nombre,
                    'modalidad' => $plame->carreraModalidad->modalidad?->nombre
                ]
            ];

            return $this->successResponse($info, 'Información del documento PLAME obtenida exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Formatear el tamaño del archivo en formato legible
     */
    private function formatearTamanoArchivo($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}
