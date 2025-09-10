<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class CarreraModalidad extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'carrera_modalidades';

    protected $fillable = [
        'carrera_id',
        'modalidad_id',
        'estado_modalidad',
        'fecha_ini_proceso',
        'fecha_fin_proceso',
        'id_usuario_updated_carrera_modalidad',
        'fecha_ini_aprobacion',
        'fecha_fin_aprobacion',
        'certificado',
        'certificado_nombre_original',
        'certificado_mime_type',
        'certificado_extension',
        'puntaje_acreditacion'
    ];

    /**
     * Relación con el modelo Carrera
     */
    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'carrera_id');
    }

    /**
     * Relación con el modelo Modalidad
     */
    public function modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'modalidad_id');
    }

    /**
     * Relación con las fases de esta carrera-modalidad
     */
    public function fases()
    {
        return $this->hasMany(Fase::class, 'carrera_modalidad_id');
    }

    /**
     * Relación con las subfases a través de las fases
     */
    public function subfases()
    {
        return $this->hasManyThrough(SubFase::class, Fase::class, 'carrera_modalidad_id', 'fase_id');
    }
}
