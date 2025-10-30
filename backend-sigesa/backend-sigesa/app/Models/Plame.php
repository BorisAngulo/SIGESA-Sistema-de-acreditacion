<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plame extends Model
{
    use HasFactory;

    protected $table = 'plames';

    protected $fillable = [
        'id_carreraModalidad',
        'nombre_documento',
        'nombre_archivo_original',
        'tipo_mime',
        'contenido_archivo',
        'tamano_archivo'
    ];

    public function carreraModalidad()
    {
        return $this->belongsTo(CarreraModalidad::class, 'id_carreraModalidad');
    }
}
