<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subfase_documento extends Model
{
    use HasFactory;

    protected $table = 'subfase_documentos';

    protected $fillable = [
        'subfase_id',
        'documento_id',
    ];
}
