<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubFase;

class SubfaseController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fase_id' => 'required|exists:fases,id',
            'nombre_subfase' => 'required|string|max:50',
            'descripcion_subfase' => 'nullable|string|max:300',
            'fecha_inicio_subfase' => 'nullable|date',
            'fecha_fin_subfase' => 'nullable|date',
            'id_usuario_updated_subfase' => 'nullable|integer',
        ]);

        $subFase = SubFase::create($validated);

        return response()->json($subFase, 201);
    }

    public function index()
    {
        $subFases = SubFase::all();
        return response()->json($subFases);
    }
}
