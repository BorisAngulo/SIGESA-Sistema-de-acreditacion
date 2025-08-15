<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Carrera extends Model
{
    use HasFactory;
    use LogsActivity;
    
    protected $table = 'carreras';

    protected $fillable = [
        'facultad_id',
        'codigo_carrera',
        'nombre_carrera',
        'pagina_carrera',
        'id_usuario_updated_carrera'
    ];

    /**
     * Relación con la facultad a la que pertenece la carrera
     */
    public function facultad()
    {
        return $this->belongsTo(Facultad::class, 'facultad_id');
    }
}
