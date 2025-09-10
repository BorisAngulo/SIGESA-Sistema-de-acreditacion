<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarreraModalidad;
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
}
