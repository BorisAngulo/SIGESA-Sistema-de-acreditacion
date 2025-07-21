<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plame extends Model
{
    use HasFactory;

    protected $table = 'plames';

    protected $fillable = [
        'id_subfase',
        'tipo_evaluacion_plame',
    ];

    public function subFase()
    {
        return $this->belongsTo(SubFase::class, 'id_subfase');
    }
}
