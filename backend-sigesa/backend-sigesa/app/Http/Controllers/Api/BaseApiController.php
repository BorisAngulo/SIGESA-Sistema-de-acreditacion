<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Exceptions\ApiException;

class BaseApiController extends Controller
{
    /**
     * Respuesta de éxito
     */
    protected function successResponse($data = null, $message = 'Operación exitosa', $code = 200): JsonResponse
    {
        return response()->json([
            'exito' => true,
            'estado' => $code,
            'mensaje' => $message,
            'datos' => $data,
            'error' => null
        ], $code);
    }

    /**
     * Respuesta de error
     */
    protected function errorResponse($message = 'Error en la operación', $code = 500, $errors = null): JsonResponse
    {
        return response()->json([
            'exito' => false,
            'estado' => $code,
            'mensaje' => $message,
            'datos' => null,
            'error' => $errors ?? $message
        ], $code);
    }

    /**
     * Respuesta de error de validación
     */
    protected function validationErrorResponse($errors, $message = 'Errores de validación'): JsonResponse
    {
        return response()->json([
            'exito' => false,
            'estado' => 422,
            'mensaje' => $message,
            'datos' => null,
            'error' => $errors
        ], 422);
    }

    /**
     * Respuesta no encontrado
     */
    protected function notFoundResponse($message = 'Recurso no encontrado'): JsonResponse
    {
        return response()->json([
            'exito' => false,
            'estado' => 404,
            'mensaje' => $message,
            'datos' => null,
            'error' => $message
        ], 404);
    }

    /**
     * Respuesta no autorizado
     */
    protected function unauthorizedResponse($message = 'No autorizado'): JsonResponse
    {
        return response()->json([
            'exito' => false,
            'estado' => 401,
            'mensaje' => $message,
            'datos' => null,
            'error' => $message
        ], 401);
    }

    /**
     * Manejar excepciones API de forma centralizada
     */
    protected function handleApiException(ApiException $e): JsonResponse
    {
        return response()->json([
            'exito' => false,
            'estado' => $e->getStatusCode(),
            'mensaje' => $e->getMessage(),
            'datos' => null,
            'error' => [
                'tipo' => $e->getErrorType(),
                'mensaje' => $e->getMessage(),
                'codigo' => $e->getStatusCode()
            ]
        ], $e->getStatusCode());
    }

    /**
     * Manejar errores de validación
     */
    protected function handleValidationException(\Illuminate\Validation\ValidationException $e): JsonResponse
    {
        return response()->json([
            'exito' => false,
            'estado' => 422,
            'mensaje' => 'Errores de validación',
            'datos' => null,
            'error' => [
                'tipo' => 'VALIDATION_ERROR',
                'errores' => $e->validator->errors(),
                'codigo' => 422
            ]
        ], 422);
    }

    /**
     * Manejar errores generales
     */
    protected function handleGeneralException(\Exception $e): JsonResponse
    {
        // En producción, no exponer detalles del error
        $message = app()->environment('local', 'testing') ? 
            $e->getMessage() : 
            'Error interno del servidor';

        return response()->json([
            'exito' => false,
            'estado' => 500,
            'mensaje' => 'Error interno del servidor',
            'datos' => null,
            'error' => [
                'tipo' => 'INTERNAL_ERROR',
                'mensaje' => $message,
                'codigo' => 500
            ]
        ], 500);
    }
}
