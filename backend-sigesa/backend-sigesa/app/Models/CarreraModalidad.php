<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarreraModalidad extends Model
{
    use HasFactory;

    protected $table = 'carrera_modalidades';

    protected $fillable = [
        'carrera_id',
        'modalidad_id',
        'estado_modalidad',
        'id_usuario_updated_carrera_modalidad',
        'fecha_ini_aprobacion',
        'fecha_fin_aprobacion',
        'certificado'
    ];
}
