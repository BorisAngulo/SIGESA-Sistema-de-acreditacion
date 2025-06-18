<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrera extends Model
{
    use HasFactory;
    
    protected $table = 'carreras';

    protected $fillable = [
        'facultad_id',
        'codigo_carrera',
        'nombre_carrera',
        'pagina_carrera',
        'id_usuario_updated_carrera'
    ];
}
