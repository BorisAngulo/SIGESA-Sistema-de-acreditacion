<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            $description = static::getCreatedDescription($model);
            $model->logActivity('created', $description, null, $model->toArray());
        });

        static::updated(function ($model) {
            $oldValues = $model->getOriginal();
            $newValues = $model->getChanges();
            
            if (!empty($newValues)) {
                $description = static::getUpdatedDescription($model, $oldValues, $newValues);
                $model->logActivity('updated', $description, $oldValues, $newValues);
            }
        });

        static::deleted(function ($model) {
            $description = static::getDeletedDescription($model);
            $model->logActivity('deleted', $description, $model->toArray(), null);
        });
    }

    public function logActivity($action, $description, $oldValues = null, $newValues = null, $properties = null)
    {
        // Omitir campos sensibles del logging
        $hiddenFields = $this->getHiddenForActivityLog();
        
        if ($oldValues) {
            $oldValues = $this->filterSensitiveData($oldValues, $hiddenFields);
        }
        
        if ($newValues) {
            $newValues = $this->filterSensitiveData($newValues, $hiddenFields);
        }

        ActivityLog::createLog(
            $action,
            $description,
            get_class($this),
            $this->id,
            $oldValues,
            $newValues,
            $properties
        );
    }

    protected function getHiddenForActivityLog()
    {
        return array_merge(
            $this->hidden ?? [],
            ['password', 'password_confirmation', 'remember_token', 'updated_at']
        );
    }

    protected function filterSensitiveData($data, $hiddenFields)
    {
        if (!is_array($data)) {
            return $data;
        }

        foreach ($hiddenFields as $field) {
            unset($data[$field]);
        }

        return $data;
    }

    // Método para obtener los logs de actividad de este modelo
    public function activityLogs()
    {
        return ActivityLog::where('model_type', get_class($this))
                         ->where('model_id', $this->id)
                         ->orderBy('created_at', 'desc');
    }

    // Método estático para obtener logs por tipo de modelo
    public static function getActivityLogs($limit = null)
    {
        $query = ActivityLog::where('model_type', static::class)
                           ->with('user')
                           ->orderBy('created_at', 'desc');
        
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    // Métodos para generar descripciones personalizadas
    protected static function getCreatedDescription($model)
    {
        $modelName = class_basename($model);
        $identifier = static::getModelIdentifier($model);
        
        return "{$modelName} '{$identifier}' creado";
    }

    protected static function getUpdatedDescription($model, $oldValues, $newValues)
    {
        $modelName = class_basename($model);
        $identifier = static::getModelIdentifier($model);
        
        return "{$modelName} '{$identifier}' actualizado";
    }

    protected static function getDeletedDescription($model)
    {
        $modelName = class_basename($model);
        $identifier = static::getModelIdentifier($model);
        
        return "{$modelName} '{$identifier}' eliminado";
    }

    protected static function getModelIdentifier($model)
    {
        // Intentar obtener un identificador descriptivo del modelo
        if (isset($model->nombre_facultad)) {
            return $model->nombre_facultad;
        }
        
        if (isset($model->nombre_carrera)) {
            return $model->nombre_carrera;
        }
        
        if (isset($model->nombre_fase)) {
            return $model->nombre_fase;
        }
        
        if (isset($model->nombre_subfase)) {
            return $model->nombre_subfase;
        }
        
        if (isset($model->nombre_documento)) {
            return $model->nombre_documento;
        }
        
        if (isset($model->nombre_modalidad)) {
            return $model->nombre_modalidad;
        }
        
        if (isset($model->name) && isset($model->lastName)) {
            return $model->name . ' ' . $model->lastName;
        }
        
        if (isset($model->name)) {
            return $model->name;
        }
        
        if (isset($model->title)) {
            return $model->title;
        }
        
        if (isset($model->codigo_modalidad)) {
            return $model->codigo_modalidad;
        }
        
        if (isset($model->codigo_carrera)) {
            return $model->codigo_carrera;
        }
        
        if (isset($model->codigo_facultad)) {
            return $model->codigo_facultad;
        }
        
        // Fallback al ID
        return "ID: {$model->id}";
    }
}
