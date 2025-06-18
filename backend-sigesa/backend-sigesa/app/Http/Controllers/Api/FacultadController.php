<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Facultad;

class FacultadController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_facultad' => 'required|string|max:50',
            'codigo_facultad' => 'required|string|max:10|unique:facultades,codigo_facultad',
            'pagina_facultad' => 'nullable|string|max:100',
            'id_usuario_updated_facultad' => 'nullable|integer',
        ]);

        $facultad = Facultad::create($validated);

        return response()->json($facultad, 201);
    }

    public function index()
    {
        $facultades = Facultad::all();
        return response()->json($facultades);
    }
}
