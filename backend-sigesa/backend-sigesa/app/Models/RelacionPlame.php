<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RelacionPlame extends Model
{
    use HasFactory;

    protected $table = 'relacion_plames';

    protected $fillable = [
        'id_plame',
        'id_fila_plame',
        'id_columna_plame',
        'valor_relacion_plame',
    ];

    public function plame()
    {
        return $this->belongsTo(Plame::class, 'id_plame');
    }

    public function filaPlame()
    {
        return $this->belongsTo(FilaPlame::class, 'id_fila_plame');
    }

    public function columnaPlame()
    {
        return $this->belongsTo(ColumnaPlame::class, 'id_columna_plame');
    }
}
