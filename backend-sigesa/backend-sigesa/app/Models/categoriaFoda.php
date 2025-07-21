<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class categoriaFoda extends Model
{
    use HasFactory;

    protected $table = 'categoria_fodas';

    protected $fillable = [
        'nombre_categoria_foda',
        'codigo_categoria_foda',
    ];
}
