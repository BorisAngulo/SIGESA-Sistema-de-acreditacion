<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ElementoFoda extends Model
{
    use HasFactory;

    protected $table = 'elemento_fodas';

    protected $fillable = [
        'id_categoria_foda',
        'id_foda_analisis',
        'descripcion_elemento_foda',
        'orden',
    ];

    protected $casts = [
        'orden' => 'integer',
    ];

    // Relación con CategoriaFoda
    public function categoriaFoda()
    {
        return $this->belongsTo(CategoriaFoda::class, 'id_categoria_foda');
    }

    // Relación con FodaAnalisis
    public function fodaAnalisis()
    {
        return $this->belongsTo(FodaAnalisis::class, 'id_foda_analisis');
    }

    // Scope para obtener elementos por categoría
    public function scopePorCategoria($query, $categoriaId)
    {
        return $query->where('id_categoria_foda', $categoriaId);
    }

    // Scope para obtener fortalezas
    public function scopeFortalezas($query)
    {
        return $query->whereHas('categoriaFoda', function($q) {
            $q->where('codigo_categoria_foda', 'F');
        });
    }

    // Scope para obtener oportunidades
    public function scopeOportunidades($query)
    {
        return $query->whereHas('categoriaFoda', function($q) {
            $q->where('codigo_categoria_foda', 'O');
        });
    }

    // Scope para obtener debilidades
    public function scopeDebilidades($query)
    {
        return $query->whereHas('categoriaFoda', function($q) {
            $q->where('codigo_categoria_foda', 'D');
        });
    }

    // Scope para obtener amenazas
    public function scopeAmenazas($query)
    {
        return $query->whereHas('categoriaFoda', function($q) {
            $q->where('codigo_categoria_foda', 'A');
        });
    }
}
