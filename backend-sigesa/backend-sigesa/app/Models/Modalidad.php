<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modalidad extends Model
{
    use HasFactory;

    protected $table = 'modalidades';

    protected $fillable = [
        'codigo_modalidad',
        'nombre_modalidad',
        'descripcion_modalidad',
        'id_usuario_updated_modalidad'
    ];
}
