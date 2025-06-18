<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facultad extends Model
{
    use HasFactory;

    protected $table = 'facultades';

    protected $fillable = [
        'nombre_facultad',
        'codigo_facultad',
        'pagina_facultad',
        'id_usuario_updated_facultad'
    ];
}
