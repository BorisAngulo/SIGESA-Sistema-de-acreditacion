<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilaPlame extends Model
{
    use HasFactory;

    protected $table = 'fila_plames';

    protected $fillable = [
        'nombre_fila_plame',
        'id_modalidad',
    ];

    public function modalidad()
    {
        return $this->belongsTo(Modalidad::class, 'id_modalidad');
    }
}
