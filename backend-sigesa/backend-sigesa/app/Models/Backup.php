<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Backup extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'file_path',
        'file_size',
        'backup_type',
        'status',
        'storage_disk',
        'google_drive_file_id',
        'created_by',
        'completed_at',
        'error_message',
        'backup_info'
    ];

    protected $casts = [
        'backup_info' => 'array',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación con el usuario que creó el backup
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accessor para el tamaño del archivo en formato legible
    public function getFileSizeFormattedAttribute()
    {
        if (!$this->file_size) return 'N/A';
        
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    // Verificar si el archivo existe
    public function fileExists()
    {
        if (!$this->file_path) return false;
        
        $disk = $this->storage_disk === 'google' ? 
            Storage::disk('google') : 
            Storage::disk('local');
            
        return $disk->exists($this->file_path);
    }

    // Obtener la URL de descarga
    public function getDownloadUrl()
    {
        if ($this->fileExists()) {
            return route('api.backups.download', $this->id);
        }
        return null;
    }

    // Scopes para filtrar backups
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeManual($query)
    {
        return $query->where('backup_type', 'manual');
    }

    public function scopeScheduled($query)
    {
        return $query->where('backup_type', 'scheduled');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
