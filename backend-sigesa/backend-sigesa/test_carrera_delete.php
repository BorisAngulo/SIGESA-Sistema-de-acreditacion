<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DIAGNÓSTICO DE ELIMINACIÓN DE CARRERA ID 67 ===" . PHP_EOL;

// Verificar si la carrera existe
$carrera = App\Models\Carrera::find(67);
if ($carrera) {
    echo "✓ Carrera encontrada: " . $carrera->nombre_carrera . " (ID: " . $carrera->id . ")" . PHP_EOL;
    echo "✓ Facultad: " . $carrera->facultad_id . PHP_EOL;
} else {
    echo "✗ Carrera con ID 67 no encontrada" . PHP_EOL;
    
    // Mostrar carreras disponibles
    $carreras = App\Models\Carrera::select('id', 'nombre_carrera')->orderBy('id')->get();
    echo "Carreras disponibles:" . PHP_EOL;
    foreach ($carreras->take(10) as $c) {
        echo "- ID " . $c->id . ": " . $c->nombre_carrera . PHP_EOL;
    }
    exit;
}

echo PHP_EOL . "=== VERIFICACIÓN DE TABLAS EXISTENTES ===" . PHP_EOL;

// Obtener todas las tablas de la base de datos
$tablas = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
echo "Tablas en la base de datos:" . PHP_EOL;
foreach ($tablas as $tabla) {
    echo "- " . $tabla->table_name . PHP_EOL;
}

echo PHP_EOL . "=== BUSCANDO REFERENCIAS A CARRERAS ===" . PHP_EOL;

// Buscar columnas que podrían referenciar carreras
$referencias = DB::select("
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE column_name LIKE '%carrera%' 
    AND table_schema = 'public'
    ORDER BY table_name, column_name
");

echo "Columnas que contienen 'carrera':" . PHP_EOL;
foreach ($referencias as $ref) {
    echo "- {$ref->table_name}.{$ref->column_name} ({$ref->data_type})" . PHP_EOL;
    
    // Para cada referencia, verificar si hay registros para carrera 67
    try {
        $count = DB::table($ref->table_name)->where($ref->column_name, 67)->count();
        if ($count > 0) {
            echo "  ⚠️  {$count} registros encontrados" . PHP_EOL;
        }
    } catch (Exception $e) {
        // Ignorar errores de tipo de datos incompatibles
    }
}

echo PHP_EOL . "=== PRUEBA DE ELIMINACIÓN REAL ===" . PHP_EOL;

try {
    $carreraTest = App\Models\Carrera::find(67);
    if ($carreraTest) {
        echo "Intentando eliminar carrera '" . $carreraTest->nombre_carrera . "' (ID: 67)..." . PHP_EOL;
        
        // Intentar eliminar para ver el error exacto
        $eliminada = $carreraTest->delete();
        
        if ($eliminada) {
            echo "✗ ERROR: La carrera fue eliminada accidentalmente!" . PHP_EOL;
            echo "Necesitas restaurarla desde un backup" . PHP_EOL;
        } else {
            echo "✓ La carrera no se eliminó (esperado)" . PHP_EOL;
        }
    }
} catch (Exception $e) {
    echo "✗ Error en eliminación: " . $e->getMessage() . PHP_EOL;
    echo "Tipo de error: " . get_class($e) . PHP_EOL;
    
    if (strpos($e->getMessage(), 'foreign key') !== false || 
        strpos($e->getMessage(), 'constraint') !== false ||
        strpos($e->getMessage(), 'violates') !== false) {
        echo "⚠️  Confirmado: Error de restricción de clave foránea" . PHP_EOL;
    }
}
