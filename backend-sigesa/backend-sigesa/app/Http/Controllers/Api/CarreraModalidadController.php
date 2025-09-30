<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarreraModalidad;
use App\Models\Carrera;
use App\Exceptions\ApiException;
/**
 * @OA\Tag(
 *     name="CarreraModalidad",
 *     description="Operaciones relacionadas con las modalidades asociadas a las carreras del sistema de acreditación UMSS SIGESA",
 *     externalDocs={
 *         "description": "Documentación de la API",
 *         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
 *    }
 * )
 */
class CarreraModalidadController extends BaseApiController
{
    public function store(Request $request)
    {   
        try {
            $validated = $request->validate([
                'carrera_id' => 'required|exists:carreras,id',
                'modalidad_id' => 'required|exists:modalidades,id',
                'estado_modalidad' => 'boolean',
                'estado_acreditacion' => 'boolean',
                'fecha_ini_proceso' => 'required|date',
                'fecha_fin_proceso' => 'required|date',
                'fecha_ini_aprobacion' => 'nullable|date',
                'fecha_fin_aprobacion' => 'nullable|date',
                'certificado' => 'nullable|string',
                'id_usuario_created_carrera_modalidad' => 'nullable|integer',
                'id_usuario_updated_carrera_modalidad' => 'nullable|integer',
            ]);

            $carreraModalidad = CarreraModalidad::create($validated);

            return $this->successResponse(
                $carreraModalidad->load(['carrera', 'modalidad']),
                'Acreditación de carrera-modalidad creada exitosamente',
                201
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Verificar permisos
            if (!auth()->user()->can('carrera_modalidades.update')) {
                \Log::warning('❌ Usuario sin permisos para actualizar carrera-modalidad', [
                    'user_id' => auth()->id(),
                    'permissions' => auth()->user()->getAllPermissions()->pluck('name')
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para actualizar carrera-modalidad',
                    'error' => 'PERMISSION_DENIED'
                ], 403);
            }

            \Log::info('🔄 INICIANDO UPDATE DE CARRERA-MODALIDAD');
            \Log::info('👤 Usuario autenticado:', [
                'id' => auth()->id(),
                'email' => auth()->user()->email,
                'roles' => auth()->user()->getRoleNames(),
                'permissions' => auth()->user()->getAllPermissions()->pluck('name')->toArray()
            ]);
            \Log::info('📋 ID recibido:', ['id' => $id]);
            \Log::info('📦 Datos recibidos en request->all():', $request->all());
            \Log::info('📅 Input específico fecha_ini_aprobacion:', ['fecha_ini_aprobacion' => $request->input('fecha_ini_aprobacion')]);
            \Log::info('📦 Input específico fecha_fin_aprobacion:', ['fecha_fin_aprobacion' => $request->input('fecha_fin_aprobacion')]);
            \Log::info('🏆 Input específico puntaje_acreditacion:', ['puntaje_acreditacion' => $request->input('puntaje_acreditacion')]);
            \Log::info('📎 ¿Tiene archivo certificado?:', ['hasFile' => $request->hasFile('certificado')]);
            \Log::info('📎 Files en request:', $request->files->all());
            \Log::info('📎 Content-Type:', ['content_type' => $request->header('Content-Type')]);
            
            $carreraModalidad = CarreraModalidad::find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            \Log::info('✅ Carrera-modalidad encontrada:', [
                'id' => $carreraModalidad->id,
                'estado_modalidad_antes' => $carreraModalidad->estado_modalidad,
                'estado_acreditacion_antes' => $carreraModalidad->estado_acreditacion
            ]);

            $validated = $request->validate([
                'carrera_id' => 'sometimes|required|exists:carreras,id',
                'modalidad_id' => 'sometimes|required|exists:modalidades,id',
                'estado_modalidad' => 'sometimes|boolean',
                'estado_acreditacion' => 'sometimes|boolean',
                'fecha_ini_proceso' => 'nullable|date',
                'fecha_fin_proceso' => 'nullable|date',
                'id_usuario_updated_carrera_modalidad' => 'nullable|integer',
                'fecha_ini_aprobacion' => 'nullable|date',
                'fecha_fin_aprobacion' => 'nullable|date',
                'certificado' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:10240',
                'certificado_nombre_original' => 'nullable|string',
                'certificado_mime_type' => 'nullable|string',
                'certificado_extension' => 'nullable|string',
                'puntaje_acreditacion' => 'nullable|numeric|min:0|max:100'
            ]);

            \Log::info('✅ Validación exitosa:', $validated);

            // Procesar archivo de certificado si se proporciona
            if ($request->hasFile('certificado')) {
                \Log::info('📎 Procesando archivo de certificado...');
                $file = $request->file('certificado');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('certificados', $fileName, 'public');
                
                // Convertir a base64 para almacenar en la base de datos
                $fileContent = file_get_contents($file->getRealPath());
                $base64 = base64_encode($fileContent);
                $validated['certificado'] = $base64;
                
                // Guardar información del archivo original
                $validated['certificado_nombre_original'] = $file->getClientOriginalName();
                $validated['certificado_mime_type'] = $file->getMimeType();
                $validated['certificado_extension'] = $file->getClientOriginalExtension();
                
                \Log::info('📎 Certificado procesado:', [
                    'fileName' => $fileName,
                    'filePath' => $filePath,
                    'originalName' => $file->getClientOriginalName(),
                    'mimeType' => $file->getMimeType(),
                    'extension' => $file->getClientOriginalExtension(),
                    'size' => strlen($base64)
                ]);
            }

            \Log::info('📝 Datos a actualizar:', $validated);

            // Lógica especial para fechas de aprobación y estado_modalidad
            if (isset($validated['fecha_ini_aprobacion']) && isset($validated['fecha_fin_aprobacion'])) {
                \Log::info('🎉 Marcando acreditación como completada porque se proporcionaron fechas de aprobación');
                $validated['estado_modalidad'] = true;
                $validated['estado_acreditacion'] = true;
            }

            \Log::info('📝 Datos finales a actualizar (con lógica aplicada):', $validated);

            $carreraModalidad->update($validated);

            \Log::info('✅ Carrera-modalidad actualizada:', [
                'id' => $carreraModalidad->id,
                'estado_modalidad_despues' => $carreraModalidad->estado_modalidad,
                'estado_acreditacion_despues' => $carreraModalidad->estado_acreditacion,
                'fecha_ini_aprobacion' => $carreraModalidad->fecha_ini_aprobacion,
                'fecha_fin_aprobacion' => $carreraModalidad->fecha_fin_aprobacion,
                'puntaje_acreditacion' => $carreraModalidad->puntaje_acreditacion
            ]);

            return $this->successResponse(
                $carreraModalidad->load(['carrera', 'modalidad']),
                'Acreditación de carrera-modalidad actualizada exitosamente'
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ Error de validación:', $e->errors());
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            \Log::error('❌ Error general en update:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/acreditacion-carreras/{id}/fechas-proceso",
     *     summary="Actualizar fechas del proceso de acreditación",
     *     description="Actualiza las fechas de inicio y fin del proceso de acreditación de una carrera-modalidad específica",
     *     tags={"CarreraModalidad"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la carrera-modalidad",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Datos de las fechas del proceso",
     *         @OA\JsonContent(
     *             required={"fecha_ini_proceso", "fecha_fin_proceso"},
     *             @OA\Property(property="fecha_ini_proceso", type="string", format="date", example="2024-01-15", description="Fecha de inicio del proceso"),
     *             @OA\Property(property="fecha_fin_proceso", type="string", format="date", example="2024-12-31", description="Fecha de fin del proceso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Fechas del proceso actualizadas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="mensaje", type="string", example="Fechas del proceso actualizadas exitosamente"),
     *             @OA\Property(property="datos", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Carrera-modalidad no encontrada"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Sin permisos"
     *     )
     * )
     */
    public function updateFechasProceso(Request $request, $id)
    {
        try {
            // Verificar permisos
            if (!auth()->user()->can('carrera_modalidades.update')) {
                \Log::warning('❌ Usuario sin permisos para actualizar fechas del proceso', [
                    'user_id' => auth()->id(),
                    'carrera_modalidad_id' => $id
                ]);
                return response()->json([
                    'exito' => false,
                    'estado' => 403,
                    'mensaje' => 'No tienes permisos para actualizar las fechas del proceso',
                    'error' => 'PERMISSION_DENIED'
                ], 403);
            }

            \Log::info('🔄 INICIANDO ACTUALIZACIÓN DE FECHAS DEL PROCESO');
            \Log::info('👤 Usuario autenticado:', [
                'id' => auth()->id(),
                'email' => auth()->user()->email
            ]);
            \Log::info('📋 ID recibido:', ['id' => $id]);
            \Log::info('📦 Datos recibidos:', $request->all());
            
            $carreraModalidad = CarreraModalidad::find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            \Log::info('✅ Carrera-modalidad encontrada:', [
                'id' => $carreraModalidad->id,
                'fecha_ini_proceso_antes' => $carreraModalidad->fecha_ini_proceso,
                'fecha_fin_proceso_antes' => $carreraModalidad->fecha_fin_proceso,
                'carrera' => $carreraModalidad->carrera->nombre ?? 'N/A',
                'modalidad' => $carreraModalidad->modalidad->nombre ?? 'N/A'
            ]);

            // Validar los datos recibidos
            $validated = $request->validate([
                'fecha_ini_proceso' => 'required|date',
                'fecha_fin_proceso' => 'required|date|after:fecha_ini_proceso'
            ], [
                'fecha_ini_proceso.required' => 'La fecha de inicio del proceso es obligatoria',
                'fecha_ini_proceso.date' => 'La fecha de inicio debe tener un formato válido',
                'fecha_fin_proceso.required' => 'La fecha de fin del proceso es obligatoria',
                'fecha_fin_proceso.date' => 'La fecha de fin debe tener un formato válido',
                'fecha_fin_proceso.after' => 'La fecha de fin debe ser posterior a la fecha de inicio'
            ]);

            \Log::info('✅ Validación de fechas exitosa:', $validated);

            // Agregar usuario que realizó la actualización
            $validated['id_usuario_updated_carrera_modalidad'] = auth()->id();
            $validated['updated_at'] = now();

            // Actualizar solo las fechas del proceso
            $carreraModalidad->update($validated);

            \Log::info('✅ Fechas del proceso actualizadas exitosamente:', [
                'id' => $carreraModalidad->id,
                'fecha_ini_proceso_despues' => $carreraModalidad->fecha_ini_proceso,
                'fecha_fin_proceso_despues' => $carreraModalidad->fecha_fin_proceso,
                'updated_by' => auth()->id(),
                'updated_at' => $carreraModalidad->updated_at
            ]);

            return $this->successResponse(
                [
                    'id' => $carreraModalidad->id,
                    'fecha_ini_proceso' => $carreraModalidad->fecha_ini_proceso,
                    'fecha_fin_proceso' => $carreraModalidad->fecha_fin_proceso,
                    'carrera' => $carreraModalidad->carrera,
                    'modalidad' => $carreraModalidad->modalidad,
                    'updated_at' => $carreraModalidad->updated_at,
                    'updated_by' => $carreraModalidad->id_usuario_updated_carrera_modalidad
                ],
                'Fechas del proceso de acreditación actualizadas exitosamente'
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ Error de validación en fechas del proceso:', $e->errors());
            return $this->validationErrorResponse($e);
        } catch (ApiException $e) {
            \Log::error('❌ Error de API en fechas del proceso:', [
                'message' => $e->getMessage(),
                'code' => $e->getCode()
            ]);
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            \Log::error('❌ Error general en actualización de fechas del proceso:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->handleGeneralException($e);
        }
    }

    public function show($id)
    {
        try {
            $carreraModalidad = CarreraModalidad::with(['carrera', 'modalidad'])->find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            return $this->successResponse(
                $carreraModalidad,
                'Acreditación de carrera-modalidad obtenida exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function index()
    {
        try {
            $carrerasModalidades = CarreraModalidad::with(['carrera', 'modalidad'])->get();

            return $this->successResponse(
                $carrerasModalidades,
                'Acreditaciones de carreras-modalidades obtenidas exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function destroy($id)
    {
        try {
            $carreraModalidad = CarreraModalidad::find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            $carreraModalidad->delete();

            return $this->successResponse(
                null,
                'Acreditación de carrera-modalidad eliminada exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function buscarActiva($carrera_id, $modalidad_id)
    {
        try {
            $carreraModalidad = CarreraModalidad::where('carrera_id', $carrera_id)
                ->where('modalidad_id', $modalidad_id)
                ->where('estado_modalidad', false)
                ->where('fecha_ini_proceso', '<=', now()) // Ya iniciada
                ->where('fecha_fin_proceso', '>=', now()) // No terminada
                ->with(['carrera', 'modalidad'])
                ->first();

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad activa', "carrera_id: $carrera_id, modalidad_id: $modalidad_id");
            }

            return $this->successResponse(
                $carreraModalidad,
                'Carrera-modalidad activa encontrada exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function getModalidadesByCarrera($carrera_id)
    {
        try {
            $modalidades = CarreraModalidad::where('carrera_id', $carrera_id)
                ->with(['modalidad', 'carrera'])
                ->get();

            return $this->successResponse(
                $modalidades,
                'Modalidades de la carrera obtenidas exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function getCarrerasByModalidad($modalidad_id)
    {
        try {
            $carreras = CarreraModalidad::where('modalidad_id', $modalidad_id)
                ->with(['carrera', 'modalidad'])
                ->get();

            return $this->successResponse(
                $carreras,
                'Carreras de la modalidad obtenidas exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function verificarAsociacion($carrera_id, $modalidad_id)
    {
        try {
            $exists = CarreraModalidad::where('carrera_id', $carrera_id)
                ->where('modalidad_id', $modalidad_id)
                ->exists();

            return $this->successResponse(
                ['existe' => $exists],
                $exists ? 'La asociación carrera-modalidad existe' : 'La asociación carrera-modalidad no existe'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function getDetallesCompletos()
    {
        try {
            $carrerasModalidades = CarreraModalidad::with([
                'carrera.facultad',
                'fases.subfases',
                'modalidad'
            ])->get();

            $resultado = $carrerasModalidades->map(function ($carreraModalidad) {
                return [
                    'id' => $carreraModalidad->id,
                    'carrera_id' => $carreraModalidad->carrera_id,
                    'modalidad_id' => $carreraModalidad->modalidad_id,
                    'estado_modalidad' => $carreraModalidad->estado_modalidad,
                    'estado_acreditacion' => $carreraModalidad->estado_acreditacion,
                    'fecha_ini_proceso' => $carreraModalidad->fecha_ini_proceso,
                    'fecha_fin_proceso' => $carreraModalidad->fecha_fin_proceso,
                    'fecha_ini_aprobacion' => $carreraModalidad->fecha_ini_aprobacion,
                    'fecha_fin_aprobacion' => $carreraModalidad->fecha_fin_aprobacion,
                    'certificado' => $carreraModalidad->certificado,
                    'created_at' => $carreraModalidad->created_at,
                    'updated_at' => $carreraModalidad->updated_at,
                    'carrera' => [
                        'id' => $carreraModalidad->carrera->id,
                        'nombre' => $carreraModalidad->carrera->nombre_carrera,
                        'facultad' => [
                            'id' => $carreraModalidad->carrera->facultad->id,
                            'nombre' => $carreraModalidad->carrera->facultad->nombre_facultad,
                        ]
                    ],
                    'fases' => $carreraModalidad->fases->map(function ($fase) {
                        return [
                            'id' => $fase->id,
                            'nombre' => $fase->nombre_fase,
                            'subfases' => $fase->subfases->map(function ($subfase) {
                                return [
                                    'id' => $subfase->id,
                                    'nombre' => $subfase->nombre_subfase,
                                ];
                            })
                        ];
                    }),
                    'modalidad' => [
                        'id' => $carreraModalidad->modalidad->id,
                        'nombre' => $carreraModalidad->modalidad->nombre_modalidad,
                    ]
                ];
            });

            return $this->successResponse(
                $resultado, 
                'Carreras-modalidades con detalles completos obtenidas exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Endpoint consolidado para obtener o crear proceso activo con validaciones inteligentes
     * Incluye validación para procesos futuros y lógica completa de gestión de procesos
     */
    public function obtenerOCrearProcesoActivo(Request $request)
    {
        try {
            \Log::info('🚀 INICIANDO ENDPOINT CONSOLIDADO - obtenerOCrearProcesoActivo');
            \Log::info('👤 Usuario autenticado:', [
                'id' => auth()->id(),
                'email' => auth()->user()->email
            ]);
            \Log::info('📦 Datos recibidos:', $request->all());

            // Validar datos de entrada
            $validated = $request->validate([
                'carrera_id' => 'required|exists:carreras,id',
                'modalidad_id' => 'required|exists:modalidades,id',
                'fecha_ini_proceso' => 'nullable|date',
                'fecha_fin_proceso' => 'nullable|date|after:fecha_ini_proceso'
            ], [
                'carrera_id.required' => 'El ID de la carrera es obligatorio',
                'carrera_id.exists' => 'La carrera especificada no existe',
                'modalidad_id.required' => 'El ID de la modalidad es obligatorio', 
                'modalidad_id.exists' => 'La modalidad especificada no existe',
                'fecha_ini_proceso.date' => 'La fecha de inicio debe tener un formato válido',
                'fecha_fin_proceso.date' => 'La fecha de fin debe tener un formato válido',
                'fecha_fin_proceso.after' => 'La fecha de fin debe ser posterior a la fecha de inicio'
            ]);

            $carreraId = $validated['carrera_id'];
            $modalidadId = $validated['modalidad_id'];
            $fechaInicioProceso = $validated['fecha_ini_proceso'] ?? now()->format('Y-m-d');
            $fechaFinProceso = $validated['fecha_fin_proceso'] ?? now()->addMonths(6)->format('Y-m-d');
            $fechaActual = now();

            \Log::info('📋 Parámetros procesados:', [
                'carrera_id' => $carreraId,
                'modalidad_id' => $modalidadId,
                'fecha_ini_proceso' => $fechaInicioProceso,
                'fecha_fin_proceso' => $fechaFinProceso,
                'fecha_actual' => $fechaActual->format('Y-m-d')
            ]);

            // 1. BUSCAR PROCESO ACTIVO (dentro de rango de fechas actual O proceso futuro)
            \Log::info('🔍 PASO 1: Buscando proceso activo...');
            $procesoActivo = CarreraModalidad::where('carrera_id', $carreraId)
                ->where('modalidad_id', $modalidadId)
                ->where(function ($query) use ($fechaActual, $fechaInicioProceso, $fechaFinProceso) {
                    // Proceso activo actual (fecha actual entre inicio y fin)
                    $query->where(function ($subQuery) use ($fechaActual) {
                        $subQuery->where('fecha_ini_proceso', '<=', $fechaActual->format('Y-m-d'))
                                 ->where('fecha_fin_proceso', '>=', $fechaActual->format('Y-m-d'));
                    })
                    // NUEVA FUNCIONALIDAD: Proceso futuro (fechas posteriores a la fecha actual)
                    ->orWhere(function ($subQuery) use ($fechaActual) {
                        $subQuery->where('fecha_ini_proceso', '>', $fechaActual->format('Y-m-d'));
                    })
                    // También considerar procesos que coincidan exactamente con las fechas solicitadas
                    ->orWhere(function ($subQuery) use ($fechaInicioProceso, $fechaFinProceso) {
                        $subQuery->where('fecha_ini_proceso', $fechaInicioProceso)
                                 ->where('fecha_fin_proceso', $fechaFinProceso);
                    });
                })
                ->with(['carrera', 'modalidad'])
                ->first();

            if ($procesoActivo) {
                $tipoEncontrado = '';
                if ($procesoActivo->fecha_ini_proceso <= $fechaActual->format('Y-m-d') && 
                    $procesoActivo->fecha_fin_proceso >= $fechaActual->format('Y-m-d')) {
                    $tipoEncontrado = 'ACTIVO_ACTUAL';
                } elseif ($procesoActivo->fecha_ini_proceso > $fechaActual->format('Y-m-d')) {
                    $tipoEncontrado = 'PROCESO_FUTURO';
                } else {
                    $tipoEncontrado = 'FECHAS_COINCIDENTES';
                }

                \Log::info('✅ PROCESO ENCONTRADO - Tipo: ' . $tipoEncontrado, [
                    'id' => $procesoActivo->id,
                    'fecha_ini_proceso' => $procesoActivo->fecha_ini_proceso,
                    'fecha_fin_proceso' => $procesoActivo->fecha_fin_proceso,
                    'estado_modalidad' => $procesoActivo->estado_modalidad,
                    'carrera' => $procesoActivo->carrera->nombre_carrera,
                    'modalidad' => $procesoActivo->modalidad->nombre_modalidad
                ]);

                return $this->successResponse([
                    'carrera_modalidad' => $procesoActivo,
                    'accion' => 'encontrado',
                    'tipo' => strtolower($tipoEncontrado),
                    'mensaje' => $this->getMensajePorTipo($tipoEncontrado)
                ], 'Proceso encontrado exitosamente');
            }

            // 2. BUSCAR CUALQUIER PROCESO EXISTENTE (para validar conflictos)
            \Log::info('🔍 PASO 2: Buscando proceso existente...');
            $procesoExistente = CarreraModalidad::where('carrera_id', $carreraId)
                ->where('modalidad_id', $modalidadId)
                ->with(['carrera', 'modalidad'])
                ->first();

            if ($procesoExistente) {
                \Log::info('⚠️ PROCESO EXISTENTE ENCONTRADO:', [
                    'id' => $procesoExistente->id,
                    'fecha_ini_proceso' => $procesoExistente->fecha_ini_proceso,
                    'fecha_fin_proceso' => $procesoExistente->fecha_fin_proceso,
                    'estado_modalidad' => $procesoExistente->estado_modalidad
                ]);

                // Verificar si las nuevas fechas NO se superponen con las existentes
                $fechaInicioExistente = \Carbon\Carbon::parse($procesoExistente->fecha_ini_proceso);
                $fechaFinExistente = \Carbon\Carbon::parse($procesoExistente->fecha_fin_proceso);
                $nuevaFechaInicio = \Carbon\Carbon::parse($fechaInicioProceso);
                $nuevaFechaFin = \Carbon\Carbon::parse($fechaFinProceso);

                $hayConflicto = !($nuevaFechaFin->lt($fechaInicioExistente) || $nuevaFechaInicio->gt($fechaFinExistente));

                if ($hayConflicto) {
                    \Log::warning('❌ CONFLICTO DE FECHAS DETECTADO');
                    return $this->errorResponse(
                        'Ya existe un proceso para esta carrera-modalidad con fechas que se superponen. ' .
                        'Proceso existente: ' . $procesoExistente->fecha_ini_proceso . ' al ' . $procesoExistente->fecha_fin_proceso,
                        409
                    );
                } else {
                    \Log::info('✅ No hay conflicto - creando nuevo proceso para diferente rango de fechas');
                }
            }

            // 3. CREAR NUEVO PROCESO
            \Log::info('🏗️ PASO 3: Creando nuevo proceso...');
            $nuevoProceso = CarreraModalidad::create([
                'carrera_id' => $carreraId,
                'modalidad_id' => $modalidadId,
                'fecha_ini_proceso' => $fechaInicioProceso,
                'fecha_fin_proceso' => $fechaFinProceso,
                'estado_modalidad' => false,
                'estado_acreditacion' => false,
                'id_usuario_created_carrera_modalidad' => auth()->id(),
                'id_usuario_updated_carrera_modalidad' => auth()->id()
            ]);

            $nuevoProceso->load(['carrera', 'modalidad']);

            $tipoCreacion = $procesoExistente ? 'creado_adicional' : 'creado_primero';
            $mensajeCreacion = $procesoExistente ? 
                'Nuevo proceso creado para rango de fechas diferente' : 
                'Primer proceso creado para esta carrera-modalidad';

            \Log::info('🎉 PROCESO CREADO EXITOSAMENTE:', [
                'id' => $nuevoProceso->id,
                'tipo' => $tipoCreacion,
                'carrera' => $nuevoProceso->carrera->nombre_carrera,
                'modalidad' => $nuevoProceso->modalidad->nombre_modalidad,
                'fecha_ini_proceso' => $nuevoProceso->fecha_ini_proceso,
                'fecha_fin_proceso' => $nuevoProceso->fecha_fin_proceso
            ]);

            return $this->successResponse([
                'carrera_modalidad' => $nuevoProceso,
                'accion' => $tipoCreacion,
                'tipo' => $tipoCreacion,
                'mensaje' => $mensajeCreacion
            ], $mensajeCreacion);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            \Log::error('💥 Error en obtenerOCrearProcesoActivo:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Método auxiliar para obtener mensajes descriptivos por tipo de proceso
     */
    private function getMensajePorTipo($tipo)
    {
        $mensajes = [
            'ACTIVO_ACTUAL' => 'Proceso activo encontrado (dentro del rango de fechas actual)',
            'PROCESO_FUTURO' => 'Proceso futuro encontrado (fechas posteriores a la fecha actual)',
            'FECHAS_COINCIDENTES' => 'Proceso encontrado con fechas coincidentes'
        ];

        return $mensajes[$tipo] ?? 'Proceso encontrado';
    }

    /**
     * Obtener proceso completo: carrera-modalidad con todas sus fases y subfases en una sola respuesta
     * Endpoint consolidado que optimiza el rendimiento reduciendo múltiples llamadas HTTP
     */
    public function getProcesoCompleto($id)
    {
        try {
            \Log::info('🚀 OBTENIENDO PROCESO COMPLETO', ['carrera_modalidad_id' => $id]);
            
            $carreraModalidad = CarreraModalidad::with([
                'carrera', 
                'modalidad',
                'fases' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'fases.subfases' => function($query) {
                    $query->orderBy('created_at', 'asc');
                }
            ])->find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            // Estructurar la respuesta consolidada
            $procesoCompleto = [
                'carrera_modalidad' => [
                    'id' => $carreraModalidad->id,
                    'carrera_id' => $carreraModalidad->carrera_id,
                    'modalidad_id' => $carreraModalidad->modalidad_id,
                    'estado_modalidad' => $carreraModalidad->estado_modalidad,
                    'estado_acreditacion' => $carreraModalidad->estado_acreditacion,
                    'fecha_ini_proceso' => $carreraModalidad->fecha_ini_proceso,
                    'fecha_fin_proceso' => $carreraModalidad->fecha_fin_proceso,
                    'fecha_ini_aprobacion' => $carreraModalidad->fecha_ini_aprobacion,
                    'fecha_fin_aprobacion' => $carreraModalidad->fecha_fin_aprobacion,
                    'puntaje_acreditacion' => $carreraModalidad->puntaje_acreditacion,
                    'created_at' => $carreraModalidad->created_at,
                    'updated_at' => $carreraModalidad->updated_at,
                    'carrera' => [
                        'id' => $carreraModalidad->carrera->id,
                        'nombre_carrera' => $carreraModalidad->carrera->nombre_carrera,
                        'facultad_id' => $carreraModalidad->carrera->facultad_id,
                    ],
                    'modalidad' => [
                        'id' => $carreraModalidad->modalidad->id,
                        'nombre_modalidad' => $carreraModalidad->modalidad->nombre_modalidad,
                    ]
                ],
                'fases' => $carreraModalidad->fases->map(function($fase) {
                    return [
                        'id' => $fase->id,
                        'nombre_fase' => $fase->nombre_fase,
                        'descripcion_fase' => $fase->descripcion_fase,
                        'fecha_inicio_fase' => $fase->fecha_inicio_fase,
                        'fecha_fin_fase' => $fase->fecha_fin_fase,
                        'url_fase' => $fase->url_fase,
                        'url_fase_respuesta' => $fase->url_fase_respuesta,
                        'observacion_fase' => $fase->observacion_fase,
                        'estado_fase' => $fase->estado_fase,
                        'carrera_modalidad_id' => $fase->carrera_modalidad_id,
                        'id_usuario_updated_user' => $fase->id_usuario_updated_user,
                        'created_at' => $fase->created_at,
                        'updated_at' => $fase->updated_at,
                        'subfases' => $fase->subfases->map(function($subfase) {
                            return [
                                'id' => $subfase->id,
                                'nombre_subfase' => $subfase->nombre_subfase,
                                'descripcion_subfase' => $subfase->descripcion_subfase,
                                'fecha_inicio_subfase' => $subfase->fecha_inicio_subfase,
                                'fecha_fin_subfase' => $subfase->fecha_fin_subfase,
                                'url_subfase' => $subfase->url_subfase,
                                'url_subfase_respuesta' => $subfase->url_subfase_respuesta,
                                'observacion_subfase' => $subfase->observacion_subfase,
                                'estado_subfase' => $subfase->estado_subfase,
                                'fase_id' => $subfase->fase_id,
                                'tiene_foda' => $subfase->tiene_foda,
                                'tiene_plame' => $subfase->tiene_plame,
                                'created_at' => $subfase->created_at,
                                'updated_at' => $subfase->updated_at,
                            ];
                        })
                    ];
                }),
                'total_fases' => $carreraModalidad->fases->count(),
                'total_subfases' => $carreraModalidad->fases->sum(function($fase) {
                    return $fase->subfases->count();
                })
            ];

            \Log::info('✅ Proceso completo obtenido exitosamente', [
                'carrera_modalidad_id' => $id,
                'total_fases' => $procesoCompleto['total_fases'],
                'total_subfases' => $procesoCompleto['total_subfases']
            ]);

            return $this->successResponse(
                $procesoCompleto, 
                'Proceso completo obtenido exitosamente'
            );

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Descargar certificado de acreditación de carrera-modalidad
     */
    public function descargarCertificado($id)
    {
        try {
            $carreraModalidad = CarreraModalidad::with(['carrera', 'modalidad'])->find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            if (!$carreraModalidad->certificado) {
                throw new ApiException('Esta carrera-modalidad no tiene certificado disponible', 404);
            }

            // Decodificar el certificado desde base64
            $certificadoData = base64_decode($carreraModalidad->certificado);
            
            if (!$certificadoData) {
                throw new ApiException('Error al decodificar el certificado', 500);
            }

            // Generar nombre del archivo usando información original si está disponible
            $nombreCarrera = str_replace(' ', '_', $carreraModalidad->carrera->nombre_carrera);
            $nombreModalidad = str_replace(' ', '_', $carreraModalidad->modalidad->nombre_modalidad);
            
            // Usar extensión original si está disponible, sino usar .pdf por defecto
            $extension = $carreraModalidad->certificado_extension ?: 'pdf';
            $nombreArchivo = "certificado_{$nombreCarrera}_{$nombreModalidad}.{$extension}";
            
            // Usar tipo MIME original si está disponible, sino usar application/pdf por defecto
            $mimeType = $carreraModalidad->certificado_mime_type ?: 'application/pdf';

            // Configurar headers para descarga
            $headers = [
                'Content-Type' => $mimeType,
                'Content-Length' => strlen($certificadoData),
                'Content-Disposition' => 'attachment; filename="' . $nombreArchivo . '"',
                'Cache-Control' => 'public, max-age=3600',
                'Pragma' => 'public',
            ];

            return response($certificadoData, 200, $headers);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener historial completo de acreditaciones de una carrera con estado actual
     * 
     * @OA\Get(
     *     path="/api/carreras/{carrera}/historial-acreditaciones",
     *     tags={"CarreraModalidad"},
     *     summary="Obtener historial de acreditaciones de una carrera",
     *     description="Obtiene todos los datos de una carrera y su historial de acreditaciones con estado actual calculado",
     *     @OA\Parameter(
     *         name="carrera",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la carrera"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Historial de acreditaciones obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="carrera_id", type="integer", example=1),
     *                 @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *                 @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *                 @OA\Property(property="estado_actual", type="string", example="Acreditada"),
     *                 @OA\Property(
     *                     property="historial_acreditaciones",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="modalidad_nombre", type="string", example="ARCOSUR"),
     *                         @OA\Property(property="fecha_ini_proceso", type="string", example="2022-01-15"),
     *                         @OA\Property(property="fecha_fin_proceso", type="string", example="2022-12-15"),
     *                         @OA\Property(property="fecha_ini_aprobacion", type="string", example="2023-01-01"),
     *                         @OA\Property(property="fecha_fin_aprobacion", type="string", example="2029-01-01"),
     *                         @OA\Property(property="estado_acreditacion", type="boolean", example=true),
     *                         @OA\Property(property="puntaje_acreditacion", type="integer", example=85)
     *                     )
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Carrera no encontrada"
     *     )
     * )
     */
    public function getHistorialAcreditaciones($carrera_id)
    {
        try {
            \Log::info('🎯 Obteniendo historial de acreditaciones para carrera: ' . $carrera_id);
            
            // Verificar que la carrera existe
            $carrera = Carrera::find($carrera_id);
            if (!$carrera) {
                throw new \Exception('Carrera no encontrada');
            }

            // Obtener todas las carreras-modalidades de esta carrera
            $carrerasModalidades = CarreraModalidad::where('carrera_id', $carrera_id)
                ->with(['modalidad', 'carrera.facultad'])
                ->orderBy('fecha_ini_proceso', 'desc')
                ->get();

            // Calcular estado actual
            $estadoActual = $this->calcularEstadoActual($carrerasModalidades);

            // Formatear historial
            $historial = $carrerasModalidades->map(function ($item) {
                return [
                    'id' => $item->id,
                    'modalidad_id' => $item->modalidad_id,
                    'modalidad_nombre' => $item->modalidad->nombre_modalidad ?? 'N/A',
                    'estado_modalidad' => $item->estado_modalidad,
                    'estado_acreditacion' => $item->estado_acreditacion,
                    'fecha_ini_proceso' => $item->fecha_ini_proceso,
                    'fecha_fin_proceso' => $item->fecha_fin_proceso,
                    'fecha_ini_aprobacion' => $item->fecha_ini_aprobacion,
                    'fecha_fin_aprobacion' => $item->fecha_fin_aprobacion,
                    'puntaje_acreditacion' => $item->puntaje_acreditacion,
                    'certificado' => $item->certificado ? true : false,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at
                ];
            });

            $respuesta = [
                'carrera_id' => $carrera->id,
                'nombre_carrera' => $carrera->nombre_carrera,
                'codigo_carrera' => $carrera->codigo_carrera,
                'facultad' => [
                    'id' => $carrera->facultad->id ?? null,
                    'nombre' => $carrera->facultad->nombre_facultad ?? 'N/A'
                ],
                'estado_actual' => $estadoActual,
                'historial_acreditaciones' => $historial,
                'total_acreditaciones' => $historial->count()
            ];

            return $this->successResponse(
                $respuesta,
                'Historial de acreditaciones obtenido exitosamente'
            );

        } catch (\Exception $e) {
            \Log::error('❌ Error al obtener historial de acreditaciones: ' . $e->getMessage());
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener historial de acreditaciones de una carrera filtrado por modalidad específica
     * 
     * @OA\Get(
     *     path="/api/carreras/{carrera}/historial-acreditaciones/{modalidad}",
     *     tags={"CarreraModalidad"},
     *     summary="Obtener historial de acreditaciones filtrado por modalidad",
     *     description="Obtiene el historial de acreditaciones de una carrera para una modalidad específica",
     *     @OA\Parameter(
     *         name="carrera",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la carrera"
     *     ),
     *     @OA\Parameter(
     *         name="modalidad",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la modalidad (1=ARCOSUR, 2=CEUB)"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Historial de acreditaciones por modalidad obtenido exitosamente"
     *     )
     * )
     */
    public function getHistorialAcreditacionesPorModalidad($carrera_id, $modalidad_id)
    {
        try {
            \Log::info('🎯 Obteniendo historial por modalidad - Carrera: ' . $carrera_id . ' Modalidad: ' . $modalidad_id);
            
            // Verificar que la carrera existe
            $carrera = Carrera::find($carrera_id);
            if (!$carrera) {
                throw new \Exception('Carrera no encontrada');
            }

            // Obtener todas las carreras-modalidades de esta carrera para la modalidad específica
            $carrerasModalidades = CarreraModalidad::where('carrera_id', $carrera_id)
                ->where('modalidad_id', $modalidad_id)
                ->with(['modalidad', 'carrera.facultad'])
                ->orderBy('fecha_ini_proceso', 'desc')
                ->get();

            \Log::info('📋 DATOS CRUDOS encontrados:', [
                'total_registros' => $carrerasModalidades->count(),
                'datos_completos' => $carrerasModalidades->toArray()
            ]);

            // VERIFICAR DATOS ESPECÍFICOS
            if ($carrerasModalidades->isNotEmpty()) {
                $primer_registro = $carrerasModalidades->first();
                \Log::info('🔍 ANALISIS DEL PRIMER REGISTRO:', [
                    'id' => $primer_registro->id,
                    'modalidad_real' => $primer_registro->modalidad_id,
                    'modalidad_nombre' => $primer_registro->modalidad->nombre_modalidad ?? 'N/A',
                    'fecha_ini_aprobacion_raw' => $primer_registro->fecha_ini_aprobacion,
                    'fecha_fin_aprobacion_raw' => $primer_registro->fecha_fin_aprobacion,
                    'fecha_ini_proceso_raw' => $primer_registro->fecha_ini_proceso,
                    'fecha_fin_proceso_raw' => $primer_registro->fecha_fin_proceso,
                    'estado_modalidad_raw' => $primer_registro->estado_modalidad,
                    'estado_acreditacion_raw' => $primer_registro->estado_acreditacion,
                    'fecha_actual_sistema' => now()->format('Y-m-d H:i:s')
                ]);
            }

            // Calcular estado actual solo para esta modalidad
            $estadoActual = $this->calcularEstadoActualPorModalidad($carrerasModalidades);

            // Formatear historial
            $historial = $carrerasModalidades->map(function ($item) {
                return [
                    'id' => $item->id,
                    'modalidad_id' => $item->modalidad_id,
                    'modalidad_nombre' => $item->modalidad->nombre_modalidad ?? 'N/A',
                    'estado_modalidad' => $item->estado_modalidad,
                    'estado_acreditacion' => $item->estado_acreditacion,
                    'fecha_ini_proceso' => $item->fecha_ini_proceso,
                    'fecha_fin_proceso' => $item->fecha_fin_proceso,
                    'fecha_ini_aprobacion' => $item->fecha_ini_aprobacion,
                    'fecha_fin_aprobacion' => $item->fecha_fin_aprobacion,
                    'puntaje_acreditacion' => $item->puntaje_acreditacion,
                    'certificado' => $item->certificado ? true : false,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at
                ];
            });

            $respuesta = [
                'carrera_id' => $carrera->id,
                'modalidad_id' => (int)$modalidad_id,
                'nombre_carrera' => $carrera->nombre_carrera,
                'codigo_carrera' => $carrera->codigo_carrera,
                'facultad' => [
                    'id' => $carrera->facultad->id ?? null,
                    'nombre' => $carrera->facultad->nombre_facultad ?? 'N/A'
                ],
                'modalidad' => [
                    'id' => (int)$modalidad_id,
                    'nombre' => $carrerasModalidades->first()->modalidad->nombre_modalidad ?? 'N/A'
                ],
                'estado_actual' => $estadoActual,
                'historial_acreditaciones' => $historial,
                'total_acreditaciones' => $historial->count(),
                'tiene_acreditaciones' => $historial->count() > 0
            ];

            return $this->successResponse(
                $respuesta,
                'Historial de acreditaciones por modalidad obtenido exitosamente'
            );

        } catch (\Exception $e) {
            \Log::error('❌ Error al obtener historial por modalidad: ' . $e->getMessage());
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Calcular el estado actual de una carrera para una modalidad específica
     */
    private function calcularEstadoActualPorModalidad($carrerasModalidades)
    {
        if ($carrerasModalidades->isEmpty()) {
            return 'Sin Acreditación';
        }

        $fechaActual = now();
        \Log::info('🔍 Calculando estado actual - Fecha actual: ' . $fechaActual->format('Y-m-d'));
        
        // Variables para rastrear diferentes estados
        $tieneAcreditacionVigente = false;
        $tieneProcesoActivo = false;
        $tieneAcreditacionVencida = false;
        $tieneAcreditacionEnPeriodoGracia = false;
        $ultimaAcreditacion = null;
        
        foreach ($carrerasModalidades as $item) {
            \Log::info("📊 Evaluando acreditación ID {$item->id}:", [
                'fecha_ini_aprobacion' => $item->fecha_ini_aprobacion,
                'fecha_fin_aprobacion' => $item->fecha_fin_aprobacion,
                'fecha_ini_proceso' => $item->fecha_ini_proceso,
                'fecha_fin_proceso' => $item->fecha_fin_proceso,
                'estado_modalidad' => $item->estado_modalidad,
                'estado_acreditacion' => $item->estado_acreditacion
            ]);

            // Verificar si tiene acreditación vigente (dentro del período de aprobación)
            if ($item->fecha_ini_aprobacion && $item->fecha_fin_aprobacion) {
                $fechaIniAprobacion = \Carbon\Carbon::parse($item->fecha_ini_aprobacion);
                $fechaFinAprobacion = \Carbon\Carbon::parse($item->fecha_fin_aprobacion);
                
                if ($fechaActual->between($fechaIniAprobacion, $fechaFinAprobacion)) {
                    $tieneAcreditacionVigente = true;
                    $ultimaAcreditacion = $item;
                    \Log::info("✅ Acreditación vigente encontrada hasta: " . $fechaFinAprobacion->format('Y-m-d'));
                } elseif ($fechaActual->greaterThan($fechaFinAprobacion)) {
                    $tieneAcreditacionVencida = true;
                    
                    // Verificar si está en período de gracia para reacreditación (2 años después del vencimiento)
                    $fechaLimiteGracia = $fechaFinAprobacion->copy()->addYears(2);
                    if ($fechaActual->lessThanOrEqualTo($fechaLimiteGracia)) {
                        $tieneAcreditacionEnPeriodoGracia = true;
                        \Log::info("🔄 Acreditación en período de gracia para reacreditación hasta: " . $fechaLimiteGracia->format('Y-m-d'));
                    }
                    
                    \Log::info("⏰ Acreditación vencida desde: " . $fechaFinAprobacion->format('Y-m-d'));
                }
            }
            
            // Verificar si está en proceso actual
            if ($item->fecha_ini_proceso && $item->fecha_fin_proceso) {
                $fechaIniProceso = \Carbon\Carbon::parse($item->fecha_ini_proceso);
                $fechaFinProceso = \Carbon\Carbon::parse($item->fecha_fin_proceso);
                
                \Log::info("🔍 VERIFICANDO PROCESO - ID {$item->id}:", [
                    'fecha_ini_proceso_original' => $item->fecha_ini_proceso,
                    'fecha_fin_proceso_original' => $item->fecha_fin_proceso,
                    'fecha_ini_proceso_parsed' => $fechaIniProceso->format('Y-m-d H:i:s'),
                    'fecha_fin_proceso_parsed' => $fechaFinProceso->format('Y-m-d H:i:s'),
                    'fecha_actual' => $fechaActual->format('Y-m-d H:i:s'),
                    'esta_despues_inicio' => $fechaActual->greaterThanOrEqualTo($fechaIniProceso),
                    'esta_antes_fin' => $fechaActual->lessThanOrEqualTo($fechaFinProceso),
                    'between_result' => $fechaActual->between($fechaIniProceso, $fechaFinProceso)
                ]);
                
                if ($fechaActual->between($fechaIniProceso, $fechaFinProceso)) {
                    $tieneProcesoActivo = true;
                    \Log::info("🔄 Proceso activo encontrado: " . $fechaIniProceso->format('Y-m-d') . " a " . $fechaFinProceso->format('Y-m-d'));
                } else {
                    \Log::info("❌ Proceso NO activo para ID {$item->id}");
                }
            }
        }
        
        // Determinar estado final según prioridades
        $estadoFinal = '';
        
        if ($tieneAcreditacionVigente && $tieneProcesoActivo) {
            $estadoFinal = 'En proceso de Reacreditación';
            \Log::info("🎯 Estado determinado: En proceso de Reacreditación (tiene acreditación vigente + proceso activo)");
        } elseif ($tieneAcreditacionVigente) {
            $estadoFinal = 'Acreditada';
            \Log::info("🎯 Estado determinado: Acreditada (tiene acreditación vigente sin proceso activo)");
        } elseif ($tieneProcesoActivo && $tieneAcreditacionVencida) {
            $estadoFinal = 'En proceso de Reacreditación';
            \Log::info("🎯 Estado determinado: En proceso de Reacreditación (proceso activo + acreditación vencida)");
        } elseif ($tieneAcreditacionEnPeriodoGracia) {
            $estadoFinal = 'En proceso de Reacreditación';
            \Log::info("🎯 Estado determinado: En proceso de Reacreditación (acreditación vencida en período de gracia)");
        } elseif ($tieneProcesoActivo) {
            $estadoFinal = 'En proceso';
            \Log::info("🎯 Estado determinado: En proceso (solo proceso activo)");
        } else {
            $estadoFinal = 'Sin Acreditación';
            \Log::info("🎯 Estado determinado: Sin Acreditación (no cumple otras condiciones)");
        }
        
        return $estadoFinal;
    }

    /**
     * Calcular el estado actual de una carrera (todas las modalidades)
     */
    private function calcularEstadoActual($carrerasModalidades)
    {
        if ($carrerasModalidades->isEmpty()) {
            return 'Sin Acreditación';
        }

        $fechaActual = now();
        \Log::info('🔍 Calculando estado general - Fecha actual: ' . $fechaActual->format('Y-m-d'));
        
        // Variables para rastrear diferentes estados por modalidad
        $tieneAcreditacionVigente = false;
        $tieneProcesoActivo = false;
        $tieneAcreditacionVencida = false;
        $tieneAcreditacionEnPeriodoGracia = false;
        $modalidadesEstados = [];
        
        foreach ($carrerasModalidades as $item) {
            $modalidadNombre = $item->modalidad->nombre_modalidad ?? 'N/A';
            
            \Log::info("📊 Evaluando acreditación ID {$item->id} - Modalidad: {$modalidadNombre}:", [
                'fecha_ini_aprobacion' => $item->fecha_ini_aprobacion,
                'fecha_fin_aprobacion' => $item->fecha_fin_aprobacion,
                'fecha_ini_proceso' => $item->fecha_ini_proceso,
                'fecha_fin_proceso' => $item->fecha_fin_proceso,
                'estado_modalidad' => $item->estado_modalidad,
                'estado_acreditacion' => $item->estado_acreditacion
            ]);

            // Verificar si tiene acreditación vigente (dentro del período de aprobación)
            if ($item->fecha_ini_aprobacion && $item->fecha_fin_aprobacion) {
                $fechaIniAprobacion = \Carbon\Carbon::parse($item->fecha_ini_aprobacion);
                $fechaFinAprobacion = \Carbon\Carbon::parse($item->fecha_fin_aprobacion);
                
                if ($fechaActual->between($fechaIniAprobacion, $fechaFinAprobacion)) {
                    $tieneAcreditacionVigente = true;
                    $modalidadesEstados[$modalidadNombre] = 'acreditada';
                    \Log::info("✅ Acreditación vigente en {$modalidadNombre} hasta: " . $fechaFinAprobacion->format('Y-m-d'));
                } elseif ($fechaActual->greaterThan($fechaFinAprobacion)) {
                    $tieneAcreditacionVencida = true;
                    
                    // Verificar si está en período de gracia para reacreditación (2 años después del vencimiento)
                    $fechaLimiteGracia = $fechaFinAprobacion->copy()->addYears(2);
                    if ($fechaActual->lessThanOrEqualTo($fechaLimiteGracia)) {
                        $tieneAcreditacionEnPeriodoGracia = true;
                        $modalidadesEstados[$modalidadNombre] = 'en_reacreditacion';
                        \Log::info("🔄 Acreditación en período de gracia en {$modalidadNombre} hasta: " . $fechaLimiteGracia->format('Y-m-d'));
                    }
                    
                    \Log::info("⏰ Acreditación vencida en {$modalidadNombre} desde: " . $fechaFinAprobacion->format('Y-m-d'));
                }
            }
            
            // Verificar si está en proceso actual
            if ($item->fecha_ini_proceso && $item->fecha_fin_proceso) {
                $fechaIniProceso = \Carbon\Carbon::parse($item->fecha_ini_proceso);
                $fechaFinProceso = \Carbon\Carbon::parse($item->fecha_fin_proceso);
                
                if ($fechaActual->between($fechaIniProceso, $fechaFinProceso)) {
                    $tieneProcesoActivo = true;
                    if (!isset($modalidadesEstados[$modalidadNombre])) {
                        $modalidadesEstados[$modalidadNombre] = 'en_proceso';
                    }
                    \Log::info("🔄 Proceso activo en {$modalidadNombre}: " . $fechaIniProceso->format('Y-m-d') . " a " . $fechaFinProceso->format('Y-m-d'));
                }
            }
        }
        
        // Determinar estado final según prioridades (considerando todas las modalidades)
        $estadoFinal = '';
        
        if ($tieneAcreditacionVigente && $tieneProcesoActivo) {
            $estadoFinal = 'En proceso de Reacreditación';
            \Log::info("🎯 Estado general determinado: En proceso de Reacreditación (tiene acreditación vigente + proceso activo)");
        } elseif ($tieneAcreditacionVigente) {
            $estadoFinal = 'Acreditada';
            \Log::info("🎯 Estado general determinado: Acreditada (tiene acreditación vigente sin proceso activo)");
        } elseif ($tieneProcesoActivo && $tieneAcreditacionVencida) {
            $estadoFinal = 'En proceso de Reacreditación';
            \Log::info("🎯 Estado general determinado: En proceso de Reacreditación (proceso activo + acreditación vencida)");
        } elseif ($tieneAcreditacionEnPeriodoGracia) {
            $estadoFinal = 'En proceso de Reacreditación';
            \Log::info("🎯 Estado general determinado: En proceso de Reacreditación (acreditación vencida en período de gracia)");
        } elseif ($tieneProcesoActivo) {
            $estadoFinal = 'En proceso';
            \Log::info("🎯 Estado general determinado: En proceso (solo proceso activo)");
        } else {
            $estadoFinal = 'Sin Acreditación';
            \Log::info("🎯 Estado general determinado: Sin Acreditación (no cumple otras condiciones)");
        }
        
        return $estadoFinal;
    }
}
