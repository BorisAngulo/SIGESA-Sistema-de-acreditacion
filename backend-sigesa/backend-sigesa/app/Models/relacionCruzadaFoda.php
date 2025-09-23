<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RelacionCruzadaFoda extends Model
{
    use HasFactory;

    protected $table = 'relacion_cruzada_fodas';

    protected $fillable = [
        'id_elemento_foda_a',
        'id_elemento_foda_b',
        'id_estrategia_foda',
        'analisis_relacion_cruzada_foda',
        'accion_recomendada_relacion_cruzada_foda',
        'prioridad_relacion_cruzada_foda',
    ];

    protected $casts = [
        'prioridad_relacion_cruzada_foda' => 'integer',
    ];

    // Relación con el primer elemento (Fortaleza o Debilidad)
    public function elementoA()
    {
        return $this->belongsTo(ElementoFoda::class, 'id_elemento_foda_a');
    }

    // Relación con el segundo elemento (Oportunidad o Amenaza)
    public function elementoB()
    {
        return $this->belongsTo(ElementoFoda::class, 'id_elemento_foda_b');
    }

    // Relación con el tipo de estrategia (FO, FA, DO, DA)
    public function tipoEstrategia()
    {
        return $this->belongsTo(EstrategiaFoda::class, 'id_estrategia_foda');
    }

    // Scope para obtener estrategias FO (Fortaleza-Oportunidad)
    public function scopeEstrategiasFO($query)
    {
        return $query->whereHas('tipoEstrategia', function($q) {
            $q->where('codigo_estrategia_foda', 'FO');
        });
    }

    // Scope para obtener estrategias FA (Fortaleza-Amenaza)
    public function scopeEstrategiasFA($query)
    {
        return $query->whereHas('tipoEstrategia', function($q) {
            $q->where('codigo_estrategia_foda', 'FA');
        });
    }

    // Scope para obtener estrategias DO (Debilidad-Oportunidad)
    public function scopeEstrategiasDO($query)
    {
        return $query->whereHas('tipoEstrategia', function($q) {
            $q->where('codigo_estrategia_foda', 'DO');
        });
    }

    // Scope para obtener estrategias DA (Debilidad-Amenaza)
    public function scopeEstrategiasDA($query)
    {
        return $query->whereHas('tipoEstrategia', function($q) {
            $q->where('codigo_estrategia_foda', 'DA');
        });
    }

    // Scope para ordenar por prioridad
    public function scopePorPrioridad($query, $orden = 'desc')
    {
        return $query->orderBy('prioridad_relacion_cruzada_foda', $orden);
    }
}
