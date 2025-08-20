<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Fase extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'fases';

    protected $fillable = [
        'carrera_modalidad_id',
        'nombre_fase',
        'descripcion_fase',
        'fecha_inicio_fase',
        'fecha_fin_fase',
        'url_fase',
        'url_fase_respuesta',
        'observacion_fase',
        'estado_fase',
        'id_usuario_updated_fase'
    ];

    /**
     * Relación con las subfases
     */
    public function subfases()
    {
        return $this->hasMany(SubFase::class, 'fase_id');
    }

    /**
     * Relación con los documentos a través de la tabla pivote fase_documentos
     */
    public function documentos()
    {
        return $this->belongsToMany(Documento::class, 'fase_documentos', 'fase_id', 'documento_id')
                    ->withTimestamps();
    }
}
