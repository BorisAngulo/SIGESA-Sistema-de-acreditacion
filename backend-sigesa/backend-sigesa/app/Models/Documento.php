<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    use HasFactory;

    protected $table = 'documentos';

    protected $fillable = [
        'nombre_documento',
        'descripcion_documento',
        'nombre_archivo_original',
        'tipo_mime',
        'contenido_archivo',
        'tamano_archivo',
        'tipo_documento',
        'id_usuario_updated',
        'id_usuario_updated_documento'
    ];

    /**
     * Relación con las fases a través de la tabla pivote fase_documentos
     */
    public function fases()
    {
        return $this->belongsToMany(Fase::class, 'fase_documentos', 'documento_id', 'fase_id')
                    ->withPivot('estado', 'observaciones', 'id_usuario_updated')
                    ->withTimestamps();
    }

    /**
     * Relación con las subfases a través de la tabla pivote subfase_documentos
     */
    public function subfases()
    {
        return $this->belongsToMany(Subfase::class, 'subfase_documentos', 'documento_id', 'subfase_id')
                    ->withPivot('estado', 'observaciones', 'id_usuario_updated')
                    ->withTimestamps();
    }

    /**
     * Relación directa con fase_documentos
     */
    public function faseDocumentos()
    {
        return $this->hasMany(Fase_documento::class, 'documento_id');
    }

    /**
     * Relación directa con subfase_documentos
     */
    public function subfaseDocumentos()
    {
        return $this->hasMany(Subfase_documento::class, 'documento_id');
    }

    /**
     * Formatear el tamaño del archivo
     */
    public function getTamanoFormateadoAttribute()
    {
        if (!$this->tamano_archivo) {
            return 'N/A';
        }

        $bytes = $this->tamano_archivo;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Verificar si el archivo existe
     */
    public function archivoExiste()
    {
        return !empty($this->contenido_archivo);
    }

    /**
     * Obtener el contenido del archivo decodificado
     */
    public function getContenidoArchivo()
    {
        if (!$this->contenido_archivo) {
            return null;
        }
        
        return base64_decode($this->contenido_archivo);
    }

    /**
     * Establecer el contenido del archivo codificado en base64
     */
    public function setContenidoArchivoAttribute($value)
    {
        if ($value) {
            $this->attributes['contenido_archivo'] = base64_encode($value);
        } else {
            $this->attributes['contenido_archivo'] = null;
        }
    }
}
