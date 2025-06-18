<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Modalidad;

class ModalidadController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo_modalidad' => 'required|string|unique:modalidades,codigo_modalidad',
            'nombre_modalidad' => 'required|string|max:50',
            'descripcion_modalidad' => 'nullable|string|max:255',
            'id_usuario_updated_modalidad' => 'nullable|integer',
        ]);

        $modalidad = Modalidad::create($validated);

        return response()->json($modalidad, 201);
    }

    public function index()
    {
        $modalidades = Modalidad::all();
        return response()->json($modalidades);
    }
}
