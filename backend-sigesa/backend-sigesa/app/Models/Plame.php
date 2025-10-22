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
        'tipo_evaluacion_plame',
    ];

    public function carreraModalidad()
    {
        return $this->belongsTo(CarreraModalidad::class, 'id_carreraModalidad');
    }
}
