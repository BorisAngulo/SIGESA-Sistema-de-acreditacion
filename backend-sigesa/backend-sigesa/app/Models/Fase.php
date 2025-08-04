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
        'id_usuario_updated_fase'
    ];
}
