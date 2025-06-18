<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarreraModalidad;

class CarreraModalidadController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'carrera_id' => 'required|exists:carreras,id',
            'modalidad_id' => 'required|exists:modalidades,id',
            'estado_modalidad' => 'boolean',
            'id_usuario_updated_carrera_modalidad' => 'nullable|integer',
            'fecha_ini_aprobacion' => 'nullable|date',
            'fecha_fin_aprobacion' => 'nullable|date',
            'certificado' => 'nullable|string',
        ]);

        $carreraModalidad = CarreraModalidad::create($validated);

        return response()->json($carreraModalidad, 201);
    }

    public function index()
    {
        $carreraModalidades = CarreraModalidad::all();
        return response()->json($carreraModalidades);
    }
}
