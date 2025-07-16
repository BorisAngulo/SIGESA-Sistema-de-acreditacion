<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class estrategiaFoda extends Model
{
    use HasFactory;

    protected $table = 'estrategia_fodas';

    protected $fillable = [
        'id_elemento_foda',
        'codigo_estrategia_foda',
        'descripcion_estrategia_foda',
        'nombre_estrategia_foda',
    ];

    public function elementoFoda()
    {
        return $this->belongsTo(elementoFoda::class, 'id_elemento_foda');
    }
}
