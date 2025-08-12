<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class SubFase extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'sub_fases';

    protected $fillable = [
        'fase_id',
        'nombre_subfase',
        'descripcion_subfase',
        'fecha_inicio_subfase',
        'fecha_fin_subfase',
        'url_subfase',
        'estado_subfase',
        'id_usuario_updated_subfase'
    ];
}
