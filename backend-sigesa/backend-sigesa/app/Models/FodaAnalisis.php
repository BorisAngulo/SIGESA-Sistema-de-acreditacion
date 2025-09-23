<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FodaAnalisis extends Model
{
    use HasFactory;

    protected $table = 'foda_analisis';

    protected $fillable = [
        'id_subfase',
        'nombre_analisis',
        'descripcion',
        'estado'
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    // Relación con SubFase
    public function subfase()
    {
        return $this->belongsTo(SubFase::class, 'id_subfase');
    }

    // Relación con ElementoFoda
    public function elementos()
    {
        return $this->hasMany(ElementoFoda::class, 'id_foda_analisis');
    }

    // Relación con estrategias cruzadas
    public function estrategiasCruzadas()
    {
        return $this->hasManyThrough(
            RelacionCruzadaFoda::class,
            ElementoFoda::class,
            'id_foda_analisis', // FK en elemento_fodas
            'id_elemento_foda_a', // FK en relacion_cruzada_fodas
            'id', // PK en foda_analisis
            'id' // PK en elemento_fodas
        );
    }

    // Método para obtener todas las estrategias cruzadas del análisis
    public function todasLasEstrategiasCruzadas()
    {
        $elementosIds = $this->elementos->pluck('id');
        
        return RelacionCruzadaFoda::whereIn('id_elemento_foda_a', $elementosIds)
            ->orWhereIn('id_elemento_foda_b', $elementosIds)
            ->with(['elementoA.categoriaFoda', 'elementoB.categoriaFoda', 'tipoEstrategia'])
            ->get();
    }

    // Scope para obtener solo análisis completados
    public function scopeCompletados($query)
    {
        return $query->where('estado', true);
    }

    // Scope para obtener solo borradores
    public function scopeBorradores($query)
    {
        return $query->where('estado', false);
    }
}
