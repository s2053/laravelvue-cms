<?php

namespace App\Domains\Media\Models;

use App\Domains\Media\Enums\MediaSourceType;
use App\Domains\Media\Enums\MediaType;
use App\Domains\Media\Enums\MediaVisibility;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Media extends Model
{
    use SoftDeletes;

    protected $table = 'media';

    protected $fillable = [
        'uuid',
        'source_type',
        'type',
        'disk',
        'directory',
        'path',
        'filename',
        'original_name',
        'extension',
        'mime_type',
        'size',
        'width',
        'height',
        'duration',
        'title',
        'alt_text',
        'caption',
        'description',
        'visibility',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'source_type' => MediaSourceType::class,
        'type' => MediaType::class,
        'visibility' => MediaVisibility::class,
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'duration' => 'integer',
        'status' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $media) {
            if (blank($media->uuid)) {
                $media->uuid = (string) Str::uuid();
            }
        });
    }

    public function variants()
    {
        return $this->hasMany(MediaVariant::class, 'media_id');
    }

    public function usages()
    {
        return $this->hasMany(MediaUsage::class, 'media_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
