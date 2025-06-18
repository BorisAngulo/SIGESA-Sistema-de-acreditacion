<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Carrera;

class CarreraController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'facultad_id' => 'required|exists:facultades,id',
            'codigo_carrera' => 'required|string|unique:carreras,codigo_carrera',
            'nombre_carrera' => 'required|string|max:50',
            'pagina_carrera' => 'nullable|string|max:100',
            'id_usuario_updated_carrera' => 'nullable|integer',
        ]);

        $carrera = Carrera::create($validated);

        return response()->json($carrera, 201);
    }

    public function index()
    {
        $carreras = Carrera::all();
        return response()->json($carreras);
    }
}
