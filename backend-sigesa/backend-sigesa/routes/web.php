<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Ruta de login simple para evitar errores de redirección
Route::get('/login', function () {
    return response()->json(['message' => 'Please use API authentication'], 401);
})->name('login');
