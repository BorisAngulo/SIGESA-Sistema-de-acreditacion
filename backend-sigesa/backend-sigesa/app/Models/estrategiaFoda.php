<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstrategiaFoda extends Model
{
    use HasFactory;

    protected $table = 'estrategia_fodas';

    protected $fillable = [
        'codigo_estrategia_foda',
        'descripcion_estrategia_foda',
        'nombre_estrategia_foda',
    ];

    // Scopes para obtener estrategias específicas
    public function scopeFO($query)
    {
        return $query->where('codigo_estrategia_foda', 'FO');
    }

    public function scopeFA($query)
    {
        return $query->where('codigo_estrategia_foda', 'FA');
    }

    public function scopeDO($query)
    {
        return $query->where('codigo_estrategia_foda', 'DO');
    }

    public function scopeDA($query)
    {
        return $query->where('codigo_estrategia_foda', 'DA');
    }

    // Método para obtener el color asociado a cada estrategia
    public function getColorAttribute()
    {
        $colores = [
            'FO' => '#059669', // Verde oscuro
            'FA' => '#dc2626', // Rojo
            'DO' => '#2563eb', // Azul
            'DA' => '#9333ea', // Morado
        ];

        return $colores[$this->codigo_estrategia_foda] ?? '#6b7280';
    }
}
