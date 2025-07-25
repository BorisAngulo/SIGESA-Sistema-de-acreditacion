<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fase_documento extends Model
{
    use HasFactory;

    protected $table = 'fase_documentos';

    protected $fillable = [
        'fase_id',
        'documento_id',
    ];
}
