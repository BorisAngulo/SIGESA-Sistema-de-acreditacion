<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== VERIFICACIÓN DE USUARIO TÉCNICO ===" . PHP_EOL;
$usuario = App\Models\User::where('email', 'tecnico@umss.edu.bo')->first();
if ($usuario) {
    echo "Usuario encontrado: " . $usuario->name . " (" . $usuario->tipo . ")" . PHP_EOL;
    echo "ID: " . $usuario->id . PHP_EOL;
    echo "Estado: " . ($usuario->activo ? 'Activo' : 'Inactivo') . PHP_EOL;
} else {
    echo "Usuario técnico no encontrado" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICACIÓN DE FACULTADES ===" . PHP_EOL;  
$facultades = App\Models\Facultad::all();
echo "Total facultades: " . $facultades->count() . PHP_EOL;
if ($facultades->count() > 0) {
    echo "Primera facultad: " . $facultades->first()->nombre_facultad . " (ID: " . $facultades->first()->id . ")" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICACIÓN DE TODOS LOS USUARIOS ===" . PHP_EOL;
$usuarios = App\Models\User::select('id', 'name', 'email')->get();
foreach ($usuarios as $user) {
    echo $user->id . " - " . $user->name . " (" . $user->email . ")" . PHP_EOL;
}

echo PHP_EOL . "=== ESTRUCTURA DE LA TABLA USERS ===" . PHP_EOL;
$columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
foreach ($columns as $column) {
    echo "- " . $column->column_name . " (" . $column->data_type . ")" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICACIÓN DE TOKENS ===" . PHP_EOL;
$tokens = DB::table('personal_access_tokens')->where('tokenable_type', 'App\Models\User')->get();
echo "Total tokens activos: " . $tokens->count() . PHP_EOL;
