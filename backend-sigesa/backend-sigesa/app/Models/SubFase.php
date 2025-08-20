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
        'id_usuario_updated_subfase'
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
}
