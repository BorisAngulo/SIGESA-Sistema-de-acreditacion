<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ColumnaPlame extends Model
{
    use HasFactory;

    protected $table = 'columna_plames';

    protected $fillable = [
        'nombre_columna_plame',
    ];
}
