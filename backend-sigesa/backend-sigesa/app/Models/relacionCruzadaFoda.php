<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class relacionCruzadaFoda extends Model
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

    public function elementoFodaA()
    {
        return $this->belongsTo(elementoFoda::class, 'id_elemento_foda_a');
    }

    public function elementoFodaB()
    {
        return $this->belongsTo(elementoFoda::class, 'id_elemento_foda_b');
    }

    public function estrategiaFoda()
    {
        return $this->belongsTo(estrategiaFoda::class, 'id_estrategia_foda');
    }
}
