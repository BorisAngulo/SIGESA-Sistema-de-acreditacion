<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FacultadController;
use App\Http\Controllers\Api\CarreraController;
use App\Http\Controllers\Api\ModalidadController;
use App\Http\Controllers\Api\CarreraModalidadController;
use App\Http\Controllers\Api\FaseController;
use App\Http\Controllers\Api\SubfaseController;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/facultades', [FacultadController::class, 'store']);
Route::post('/carreras', [CarreraController::class, 'store']);
Route::get('/carreras', [CarreraController::class, 'index']);
Route::get('/facultades', [FacultadController::class, 'index']);
Route::post('/modalidades', [ModalidadController::class, 'store']);
Route::get('/modalidades', [ModalidadController::class, 'index']);
Route::post('/acreditacion-carreras',[CarreraModalidadController::class, 'store']);
Route::get('/acreditacion-carreras', [CarreraModalidadController::class, 'index']);
Route::post('/fases', [FaseController::class, 'store']);
Route::get('/fases', [FaseController::class, 'index']);
Route::post('/subfases', [SubfaseController::class, 'store']);
Route::get('/subfases', [SubfaseController::class, 'index']);
