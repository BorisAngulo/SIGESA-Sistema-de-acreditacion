<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Facultad extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'facultades';

    protected $fillable = [
        'nombre_facultad',
        'codigo_facultad',
        'pagina_facultad',
        'id_usuario_updated_facultad'
    ];
}
