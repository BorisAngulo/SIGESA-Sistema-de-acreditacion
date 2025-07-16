<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class elementoFoda extends Model
{
    use HasFactory;

    protected $table = 'elemento_fodas';

    protected $fillable = [
        'id_categoria_foda',
        'id_subfase',
        'descripcion_elemento_foda',
    ];

    public function categoriaFoda()
    {
        return $this->belongsTo(categoriaFoda::class, 'id_categoria_foda');
    }

    public function subFase()
    {
        return $this->belongsTo(subFase::class, 'id_subfase');
    }
}
