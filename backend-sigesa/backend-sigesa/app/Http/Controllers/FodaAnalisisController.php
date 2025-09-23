<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FodaAnalisis;
use App\Models\ElementoFoda;
use App\Models\CategoriaFoda;
use App\Models\EstrategiaFoda;
use App\Models\RelacionCruzadaFoda;
use App\Models\SubFase;
use Illuminate\Support\Facades\Validator;

class FodaAnalisisController extends Controller
{
    /**
     * Obtener el análisis FODA de una subfase
     */
    public function getBySubfase($subfaseId)
    {
        try {
            $subfase = SubFase::findOrFail($subfaseId);
            
            if (!$subfase->tiene_foda) {
                return response()->json([
                    'estado' => false,
                    'mensaje' => 'Esta subfase no tiene análisis FODA habilitado'
                ], 400);
            }

            $fodaAnalisis = FodaAnalisis::where('id_subfase', $subfaseId)
                ->with([
                    'elementos.categoriaFoda',
                    'subfase'
                ])
                ->first();

            if (!$fodaAnalisis) {
                // Crear un nuevo análisis FODA para la subfase
                $fodaAnalisis = FodaAnalisis::create([
                    'id_subfase' => $subfaseId,
                    'nombre_analisis' => 'Análisis FODA - ' . $subfase->nombre_subfase,
                    'descripcion' => 'Análisis FODA para la subfase: ' . $subfase->nombre_subfase,
                    'estado' => false
                ]);

                $fodaAnalisis->load(['elementos.categoriaFoda', 'subfase']);
            }

            // Obtener categorías para estructurar la respuesta
            $categorias = CategoriaFoda::all();
            
            $respuesta = [
                'analisis' => $fodaAnalisis,
                'categorias' => $categorias,
                'elementos_por_categoria' => []
            ];

            // Organizar elementos por categoría
            foreach ($categorias as $categoria) {
                $respuesta['elementos_por_categoria'][$categoria->codigo_categoria_foda] = 
                    $fodaAnalisis->elementos->where('id_categoria_foda', $categoria->id)->values();
            }

            return response()->json([
                'estado' => true,
                'mensaje' => 'Análisis FODA obtenido exitosamente'
            ] + $respuesta);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al obtener el análisis FODA: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un elemento FODA
     */
    public function storeElemento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_foda_analisis' => 'required|exists:foda_analisis,id',
            'id_categoria_foda' => 'required|exists:categoria_fodas,id',
            'descripcion_elemento_foda' => 'required|string|max:300',
            'orden' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Datos inválidos',
                'errores' => $validator->errors()
            ], 400);
        }

        try {
            $elemento = ElementoFoda::create($request->all());
            $elemento->load('categoriaFoda');

            return response()->json([
                'estado' => true,
                'mensaje' => 'Elemento FODA creado exitosamente',
                'elemento' => $elemento
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al crear el elemento FODA: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un elemento FODA
     */
    public function updateElemento(Request $request, $elementoId)
    {
        $validator = Validator::make($request->all(), [
            'descripcion_elemento_foda' => 'required|string|max:300',
            'orden' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Datos inválidos',
                'errores' => $validator->errors()
            ], 400);
        }

        try {
            $elemento = ElementoFoda::findOrFail($elementoId);
            $elemento->update($request->all());

            return response()->json([
                'estado' => true,
                'mensaje' => 'Elemento FODA actualizado exitosamente',
                'elemento' => $elemento->load('categoriaFoda')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al actualizar el elemento FODA: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un elemento FODA
     */
    public function deleteElemento($elementoId)
    {
        try {
            $elemento = ElementoFoda::findOrFail($elementoId);
            $elemento->delete();

            return response()->json([
                'estado' => true,
                'mensaje' => 'Elemento FODA eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al eliminar el elemento FODA: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar el estado del análisis FODA
     */
    public function updateEstado(Request $request, $analisisId)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Datos inválidos',
                'errores' => $validator->errors()
            ], 400);
        }

        try {
            $analisis = FodaAnalisis::findOrFail($analisisId);
            $analisis->update(['estado' => $request->estado]);

            return response()->json([
                'estado' => true,
                'mensaje' => 'Estado del análisis FODA actualizado exitosamente',
                'datos' => $analisis
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al actualizar el estado: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una estrategia cruzada
     */
    public function storeEstrategiaCruzada(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_elemento_foda_a' => 'required|exists:elemento_fodas,id',
            'id_elemento_foda_b' => 'required|exists:elemento_fodas,id',
            'id_estrategia_foda' => 'required|exists:estrategia_fodas,id',
            'analisis_relacion_cruzada_foda' => 'required|string|max:300',
            'accion_recomendada_relacion_cruzada_foda' => 'nullable|string|max:300',
            'prioridad_relacion_cruzada_foda' => 'nullable|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Datos inválidos',
                'errores' => $validator->errors()
            ], 400);
        }

        try {
            $estrategia = RelacionCruzadaFoda::create($request->all());

            return response()->json([
                'estado' => true,
                'mensaje' => 'Estrategia cruzada creada exitosamente',
                'datos' => $estrategia->load(['elementoA.categoriaFoda', 'elementoB.categoriaFoda', 'tipoEstrategia'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al crear la estrategia cruzada: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estrategias cruzadas de un análisis FODA
     */
    public function getEstrategiasCruzadas($analisisId)
    {
        try {
            $analisis = FodaAnalisis::findOrFail($analisisId);
            $estrategias = $analisis->todasLasEstrategiasCruzadas();

            return response()->json([
                'estado' => true,
                'mensaje' => 'Estrategias cruzadas obtenidas exitosamente',
                'datos' => $estrategias
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al obtener las estrategias cruzadas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener tipos de estrategias disponibles
     */
    public function getTiposEstrategias()
    {
        try {
            $tipos = EstrategiaFoda::all();

            return response()->json([
                'estado' => true,
                'mensaje' => 'Tipos de estrategias obtenidos exitosamente',
                'datos' => $tipos
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'estado' => false,
                'mensaje' => 'Error al obtener los tipos de estrategias: ' . $e->getMessage()
            ], 500);
        }
    }
}
