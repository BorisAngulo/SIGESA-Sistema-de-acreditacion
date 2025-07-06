<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    protected $statusCode;
    protected $errorType;

    public function __construct($message = 'Error en la API', $statusCode = 500, $errorType = 'INTERNAL_ERROR')
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->errorType = $errorType;
    }

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getErrorType()
    {
        return $this->errorType;
    }

    // === ERRORES COMUNES ===

    public static function notFound($resource = 'Recurso', $id = null)
    {
        $message = $id ? 
            "El {$resource} con ID {$id} no fue encontrado." : 
            "El {$resource} no fue encontrado.";
        return new static($message, 404, 'NOT_FOUND');
    }

    public static function alreadyExists($resource, $field, $value)
    {
        return new static(
            "El {$resource} con {$field} '{$value}' ya existe en el sistema.",
            422, 
            'ALREADY_EXISTS'
        );
    }

    public static function creationFailed($resource = 'recurso')
    {
        return new static(
            "Error al crear el {$resource}. Inténtelo nuevamente.",
            500, 
            'CREATION_FAILED'
        );
    }

    public static function updateFailed($resource = 'recurso')
    {
        return new static(
            "Error al actualizar el {$resource}. Inténtelo nuevamente.",
            500, 
            'UPDATE_FAILED'
        );
    }

    public static function deleteFailed($resource = 'recurso')
    {
        return new static(
            "Error al eliminar el {$resource}. Inténtelo nuevamente.",
            500, 
            'DELETE_FAILED'
        );
    }

    public static function unauthorized($action = 'realizar esta acción')
    {
        return new static(
            "No tienes permisos para {$action}.",
            401, 
            'UNAUTHORIZED'
        );
    }

    public static function forbidden($action = 'realizar esta acción')
    {
        return new static(
            "No tienes privilegios suficientes para {$action}.",
            403, 
            'FORBIDDEN'
        );
    }

    public static function validationError($message = 'Datos de validación incorrectos')
    {
        return new static($message, 422, 'VALIDATION_ERROR');
    }

    public static function serverError($message = 'Error interno del servidor')
    {
        return new static($message, 500, 'INTERNAL_ERROR');
    }

    public static function badRequest($message = 'Solicitud incorrecta')
    {
        return new static($message, 400, 'BAD_REQUEST');
    }

    public static function conflict($message = 'Conflicto en la operación')
    {
        return new static($message, 409, 'CONFLICT');
    }

    // === ERRORES ESPECÍFICOS DE NEGOCIO ===

    public static function businessRule($message)
    {
        return new static($message, 422, 'BUSINESS_RULE_VIOLATION');
    }

    public static function externalServiceError($service = 'servicio externo')
    {
        return new static(
            "Error al comunicarse con {$service}. Inténtelo más tarde.",
            503, 
            'EXTERNAL_SERVICE_ERROR'
        );
    }

    public static function rateLimitExceeded($message = 'Límite de solicitudes excedido')
    {
        return new static($message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
