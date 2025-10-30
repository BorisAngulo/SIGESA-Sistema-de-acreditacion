<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fase;
use App\Models\Subfase;
use App\Exceptions\ApiException;
use App\Templates\FasesTemplate;
use Illuminate\Support\Facades\DB;
/**
* @OA\Tag(
*     name="Fase",
*     description="Operaciones relacionadas con las fases del sistema de acreditación UMSS SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class FaseController extends BaseApiController
{

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'carrera_modalidad_id' => 'required|exists:carrera_modalidades,id',
                'nombre_fase' => 'required|string|max:50',
                'descripcion_fase' => 'nullable|string|max:300',
                'fecha_inicio_fase' => 'nullable|date',
                'fecha_fin_fase' => 'nullable|date',
                'url_fase' => 'nullable|string',
                'url_fase_respuesta' => 'nullable|string',
                'observacion_fase' => 'nullable|string|max:300',
                'estado_fase' => 'nullable|boolean',
                'id_usuario_updated_fase' => 'nullable|integer',
            ]);

            $fase = Fase::create($validated);

            if (!$fase) {
                throw ApiException::creationFailed('fase');
            }

            return $this->successResponse($fase, 'Fase creada exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function index(Request $request)
    {
        try {
            $query = Fase::query();

            // Filtrar por carrera_modalidad_id si se envía en la query string
            if ($request->has('carrera_modalidad_id')) {
                $query->where('carrera_modalidad_id', $request->input('carrera_modalidad_id'));
            }

            $fases = $query->get();

            if ($fases->isEmpty()) {
                return $this->successResponse([], 'No hay fases registradas', 200);
            }

            return $this->successResponse($fases, 'Fases obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las fases', 500, $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $fase = Fase::find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            return $this->successResponse($fase, 'fase encontrada');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $fase = Fase::find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            $validated = $request->validate([
                'carrera_modalidad_id' => 'sometimes|required|exists:carrera_modalidades,id',
                'nombre_fase' => 'sometimes|required|string|max:50',
                'descripcion_fase' => 'nullable|string|max:300',
                'fecha_inicio_fase' => 'nullable|date',
                'fecha_fin_fase' => 'nullable|date',
                'url_fase' => 'nullable|string',
                'url_fase_respuesta' => 'nullable|string',
                'observacion_fase' => 'nullable|string|max:300',
                'estado_fase' => 'nullable|boolean',
                'id_usuario_updated_fase' => 'nullable|integer',
            ]);

            $updated = $fase->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('fase');
            }

            return $this->successResponse($fase->fresh(), 'Fase actualizada exitosamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function destroy($id)
    {
        try {
            $fase = Fase::find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            $deleted = $fase->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('fase');
            }

            return $this->successResponse(null, 'Fase eliminada exitosamente', 200);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/fases/{id}/avance",
     *     summary="Obtener el porcentaje de avance de una fase",
     *     description="Calcula el porcentaje de avance de una fase basado en las subfases completadas (estado_subfase=true)",
     *     tags={"Fase"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la fase",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Porcentaje de avance obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="mensaje", type="string", example="Avance de fase obtenido exitosamente"),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="fase_id", type="integer", example=1),
     *                 @OA\Property(property="nombre_fase", type="string", example="Fase de Autoevaluación"),
     *                 @OA\Property(property="total_subfases", type="integer", example=5),
     *                 @OA\Property(property="subfases_completadas", type="integer", example=3),
     *                 @OA\Property(property="porcentaje_avance", type="integer", example=60)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Fase no encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=404),
     *             @OA\Property(property="mensaje", type="string", example="Fase no encontrada"),
     *             @OA\Property(property="error", type="object")
     *         )
     *     )
     * )
     */
    public function getAvance($id)
    {
        try {
            $fase = Fase::with('subfases')->find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            // Obtener todas las subfases de la fase
            $totalSubfases = $fase->subfases->count();
            
            // Contar las subfases completadas (estado_subfase = true)
            $subfasesCompletadas = $fase->subfases->where('estado_subfase', true)->count();

            // Calcular el porcentaje de avance
            $porcentajeAvance = $totalSubfases > 0 
                ? (int) round(($subfasesCompletadas / $totalSubfases) * 100) 
                : 0;

            $resultado = [
                'fase_id' => $fase->id,
                'nombre_fase' => $fase->nombre_fase,
                'total_subfases' => $totalSubfases,
                'subfases_completadas' => $subfasesCompletadas,
                'porcentaje_avance' => $porcentajeAvance
            ];

            return $this->successResponse($resultado, 'Avance de fase obtenido exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/fases/generar-plantilla",
     *     summary="Generar plantilla de fases y subfases",
     *     description="Crea una plantilla completa de fases y subfases para una carrera-modalidad específica",
     *     tags={"Fase"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"carrera_modalidad_id"},
     *             @OA\Property(property="carrera_modalidad_id", type="integer", example=1, description="ID de la carrera-modalidad")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Plantilla generada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=201),
     *             @OA\Property(property="mensaje", type="string", example="Plantilla de fases y subfases generada exitosamente"),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="carrera_modalidad_id", type="integer", example=1),
     *                 @OA\Property(property="fases_creadas", type="integer", example=4),
     *                 @OA\Property(property="subfases_creadas", type="integer", example=19),
     *                 @OA\Property(
     *                     property="fases",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="nombre_fase", type="string", example="Fase de Autoevaluación"),
     *                         @OA\Property(property="descripcion_fase", type="string", example="Proceso interno de evaluación"),
     *                         @OA\Property(property="subfases_count", type="integer", example=5)
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error de validación o fases ya existen",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=400),
     *             @OA\Property(property="mensaje", type="string", example="Ya existen fases para esta carrera-modalidad"),
     *             @OA\Property(property="error", type="object")
     *         )
     *     )
     * )
     */
    public function generarPlantilla(Request $request)
    {
        try {
            $validated = $request->validate([
                'carrera_modalidad_id' => 'required|exists:carrera_modalidades,id'
            ]);

            $carreraModalidadId = $validated['carrera_modalidad_id'];

            // Verificar si ya existen fases para esta carrera-modalidad
            $fasesExistentes = Fase::where('carrera_modalidad_id', $carreraModalidadId)->count();
            
            if ($fasesExistentes > 0) {
                return $this->errorResponse(
                    'Ya existen fases para esta carrera-modalidad', 
                    400, 
                    'Debe eliminar las fases existentes antes de generar una nueva plantilla'
                );
            }

            DB::beginTransaction();

            $plantillaFases = FasesTemplate::getTemplate();
            $fasesCreadas = [];
            $totalSubfasesCreadas = 0;

            foreach ($plantillaFases as $index => $plantillaFase) {
                // Crear la fase
                $fase = Fase::create([
                    'carrera_modalidad_id' => $carreraModalidadId,
                    'nombre_fase' => $plantillaFase['nombre_fase'],
                    'descripcion_fase' => $plantillaFase['descripcion_fase'],
                    'estado_fase' => false,
                    'fecha_inicio_fase' => null,
                    'fecha_fin_fase' => null,
                    'url_fase' => null,
                    'url_fase_respuesta' => null,
                    'observacion_fase' => null,
                    'id_usuario_updated_fase' => null
                ]);

                $subfasesCount = 0;

                // Crear las subfases asociadas
                foreach ($plantillaFase['subfases'] as $plantillaSubfase) {
                    Subfase::create([
                        'fase_id' => $fase->id,
                        'nombre_subfase' => $plantillaSubfase['nombre_subfase'],
                        'descripcion_subfase' => $plantillaSubfase['descripcion_subfase'],
                        'estado_subfase' => $plantillaSubfase['estado_subfase'],
                        'fecha_inicio_subfase' => null,
                        'fecha_fin_subfase' => null,
                        'url_subfase' => null,
                        'url_subfase_respuesta' => null,
                        'observacion_subfase' => null,
                        'id_usuario_updated_subfase' => null
                    ]);
                    $subfasesCount++;
                    $totalSubfasesCreadas++;
                }

                $fasesCreadas[] = [
                    'id' => $fase->id,
                    'nombre_fase' => $fase->nombre_fase,
                    'descripcion_fase' => $fase->descripcion_fase,
                    'subfases_count' => $subfasesCount
                ];
            }

            DB::commit();

            $resultado = [
                'carrera_modalidad_id' => $carreraModalidadId,
                'fases_creadas' => count($fasesCreadas),
                'subfases_creadas' => $totalSubfasesCreadas,
                'fases' => $fasesCreadas
            ];

            return $this->successResponse(
                $resultado, 
                'Plantilla de fases y subfases generada exitosamente', 
                201
            );

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
}
