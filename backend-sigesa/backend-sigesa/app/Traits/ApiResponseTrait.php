<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    /**
     * Respuesta exitosa
     */
    public function successResponse($data = null, $message = 'Operación exitosa', $code = 200): JsonResponse
    {
        return response()->json([
            'estado' => true,
            'mensaje' => $message,
            'datos' => $data
        ], $code);
    }

    /**
     * Respuesta de error
     */
    public function errorResponse($message = 'Error en la operación', $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'estado' => false,
            'mensaje' => $message
        ];

        if ($errors) {
            $response['errores'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Respuesta de validación
     */
    public function validationErrorResponse($errors, $message = 'Datos inválidos'): JsonResponse
    {
        return response()->json([
            'estado' => false,
            'mensaje' => $message,
            'errores' => $errors
        ], 422);
    }

    /**
     * Respuesta de no encontrado
     */
    public function notFoundResponse($message = 'Recurso no encontrado'): JsonResponse
    {
        return response()->json([
            'estado' => false,
            'mensaje' => $message
        ], 404);
    }

    /**
     * Respuesta de no autorizado
     */
    public function unauthorizedResponse($message = 'No autorizado'): JsonResponse
    {
        return response()->json([
            'estado' => false,
            'mensaje' => $message
        ], 401);
    }
}
