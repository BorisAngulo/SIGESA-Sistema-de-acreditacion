<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class SubFase extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'sub_fases';

    protected $fillable = [
        'fase_id',
        'nombre_subfase',
        'descripcion_subfase',
        'fecha_inicio_subfase',
        'fecha_fin_subfase',
        'url_subfase',
        'url_subfase_respuesta',
        'observacion_subfase',
        'estado_subfase',
        'id_usuario_updated_subfase',
        'tiene_foda',
        'tiene_plame'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     */
    protected $casts = [
        'estado_subfase' => 'boolean',
        'tiene_foda' => 'boolean',
        'tiene_plame' => 'boolean',
        'fecha_inicio_subfase' => 'date',
        'fecha_fin_subfase' => 'date',
    ];

    /**
     * Relación con la fase padre
     */
    public function fase()
    {
        return $this->belongsTo(Fase::class, 'fase_id');
    }

    /**
     * Relación con los documentos a través de la tabla pivote subfase_documentos
     */
    public function documentos()
    {
        return $this->belongsToMany(Documento::class, 'subfase_documentos', 'subfase_id', 'documento_id')
                    ->withTimestamps();
    }

    /**
     * Relación con el análisis FODA (uno a uno)
     */
    public function fodaAnalisis()
    {
        return $this->hasOne(FodaAnalisis::class, 'id_subfase');
    }

    /**
     * Relación con análisis PLAME
     */
    public function plames()
    {
        return $this->hasMany(Plame::class, 'id_subfase');
    }

    /**
     * Verificar si la subfase tiene un análisis FODA activo
     */
    public function tieneFodaActivo()
    {
        return $this->tiene_foda && $this->fodaAnalisis()->exists();
    }

    /**
     * Verificar si la subfase tiene análisis PLAME activo
     */
    public function tienePlameActivo()
    {
        return $this->tiene_plame && $this->plames()->exists();
    }
}
