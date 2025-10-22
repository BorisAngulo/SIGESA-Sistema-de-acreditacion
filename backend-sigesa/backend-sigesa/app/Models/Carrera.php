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

    /**
     * Relación con las modalidades a través de CarreraModalidad (carrera_modalidades)
     */
    public function modalidades()
    {
        return $this->belongsToMany(Modalidad::class, 'carrera_modalidades', 'carrera_id', 'modalidad_id');
    }

    /**
     * Relación con CarreraModalidad
     */
    public function carreraModalidades()
    {
        return $this->hasMany(CarreraModalidad::class, 'carrera_id');
    }
}
