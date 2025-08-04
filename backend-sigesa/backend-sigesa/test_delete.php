<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DIAGNÓSTICO DE ELIMINACIÓN DE FACULTAD ===" . PHP_EOL;

// Verificar usuario admin
$admin = App\Models\User::where('email', 'admin@gmail.com')->first();
if ($admin) {
    echo "✓ Usuario admin encontrado: " . $admin->name . " (ID: " . $admin->id . ")" . PHP_EOL;
} else {
    echo "✗ Usuario admin no encontrado" . PHP_EOL;
}

// Verificar facultades
$facultades = App\Models\Facultad::all();
echo "✓ Total facultades: " . $facultades->count() . PHP_EOL;

if ($facultades->count() > 0) {
    $primeraFacultad = $facultades->first();
    echo "✓ Primera facultad: " . $primeraFacultad->nombre_facultad . " (ID: " . $primeraFacultad->id . ")" . PHP_EOL;
    
echo PHP_EOL . "=== PRUEBA DE ELIMINACIÓN REAL ===" . PHP_EOL;

// Verificar dependencias de la primera facultad
$carreras = DB::table('carreras')->where('facultad_id', $primeraFacultad->id)->count();
echo "- Carreras que dependen de facultad '" . $primeraFacultad->nombre_facultad . "': " . $carreras . PHP_EOL;

if ($carreras > 0) {
    echo "⚠️  Esta facultad tiene " . $carreras . " carreras asociadas. No se puede eliminar directamente." . PHP_EOL;
    
    // Crear una facultad sin dependencias para probar
    echo PHP_EOL . "=== CREANDO FACULTAD SIN DEPENDENCIAS PARA PRUEBA ===" . PHP_EOL;
    try {
        $facultadPrueba = new App\Models\Facultad();
        $facultadPrueba->nombre_facultad = 'Facultad de Prueba';
        $facultadPrueba->codigo_facultad = 'TEST';
        $facultadPrueba->pagina_facultad = 'https://test.umss.edu.bo';
        $facultadPrueba->save();
        
        echo "✓ Facultad de prueba creada: ID " . $facultadPrueba->id . PHP_EOL;
        
        // Verificar que no tiene carreras
        $carrerasTest = DB::table('carreras')->where('facultad_id', $facultadPrueba->id)->count();
        echo "- Carreras de la facultad de prueba: " . $carrerasTest . PHP_EOL;
        
        // Intentar eliminarla
        $eliminada = $facultadPrueba->delete();
        
        if ($eliminada) {
            echo "✓ Facultad sin dependencias eliminada exitosamente" . PHP_EOL;
        } else {
            echo "✗ No se pudo eliminar la facultad sin dependencias" . PHP_EOL;
        }
        
    } catch (Exception $e) {
        echo "✗ Error al crear/eliminar facultad de prueba: " . $e->getMessage() . PHP_EOL;
        echo "Tipo de error: " . get_class($e) . PHP_EOL;
    }
} else {
    echo "✓ Esta facultad no tiene carreras asociadas. Se puede intentar eliminar." . PHP_EOL;
    
    try {
        // Hacer una copia para restaurar si es necesario
        $datosOriginales = [
            'nombre_facultad' => $primeraFacultad->nombre_facultad,
            'codigo_facultad' => $primeraFacultad->codigo_facultad,
            'pagina_facultad' => $primeraFacultad->pagina_facultad,
        ];
        
        echo "⚠️  NO eliminando facultad real por seguridad" . PHP_EOL;
        echo "Datos que se eliminarían: " . json_encode($datosOriginales) . PHP_EOL;
        
    } catch (Exception $e) {
        echo "✗ Error al intentar eliminar: " . $e->getMessage() . PHP_EOL;
    }
}
}

echo PHP_EOL . "=== VERIFICACIÓN DE MIDDLEWARE ===" . PHP_EOL;
// Simular una request para verificar middleware
try {
    $request = new Illuminate\Http\Request();
    $request->headers->set('Authorization', 'Bearer test-token');
    
    echo "✓ Request simulada creada" . PHP_EOL;
} catch (Exception $e) {
    echo "✗ Error creando request: " . $e->getMessage() . PHP_EOL;
}
