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
        'certificado'
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
}
