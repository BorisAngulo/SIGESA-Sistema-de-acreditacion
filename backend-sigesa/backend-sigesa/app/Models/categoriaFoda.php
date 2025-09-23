<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaFoda extends Model
{
    use HasFactory;

    protected $table = 'categoria_fodas';

    protected $fillable = [
        'nombre_categoria_foda',
        'codigo_categoria_foda',
    ];

    // Relación con ElementoFoda
    public function elementos()
    {
        return $this->hasMany(ElementoFoda::class, 'id_categoria_foda');
    }

    // Scopes para obtener categorías específicas
    public function scopeFortalezas($query)
    {
        return $query->where('codigo_categoria_foda', 'F');
    }

    public function scopeOportunidades($query)
    {
        return $query->where('codigo_categoria_foda', 'O');
    }

    public function scopeDebilidades($query)
    {
        return $query->where('codigo_categoria_foda', 'D');
    }

    public function scopeAmenazas($query)
    {
        return $query->where('codigo_categoria_foda', 'A');
    }
}
