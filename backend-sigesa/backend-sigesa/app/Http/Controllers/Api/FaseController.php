<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fase;

class FaseController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'carrera_modalidad_id' => 'required|exists:carrera_modalidades,id',
            'nombre_fase' => 'required|string|max:50',
            'descripcion_fase' => 'nullable|string|max:300',
            'fecha_inicio_fase' => 'nullable|date',
            'fecha_fin_fase' => 'nullable|date',
            'id_usuario_updated_fase' => 'nullable|integer',
        ]);

        $fase = Fase::create($validated);

        return response()->json($fase, 201);
    }

    public function index()
    {
        $fases = Fase::all();
        return response()->json($fases);
    }
}
