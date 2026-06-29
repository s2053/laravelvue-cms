<?php

namespace App\Domains\Media\Models;

use Illuminate\Database\Eloquent\Model;

class MediaVariant extends Model
{
    protected $table = 'media_variants';

    protected $fillable = [
        'media_id',
        'variant',
        'disk',
        'path',
        'filename',
        'mime_type',
        'extension',
        'size',
        'width',
        'height',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function media()
    {
        return $this->belongsTo(Media::class, 'media_id');
    }
}
