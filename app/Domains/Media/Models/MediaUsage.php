<?php

namespace App\Domains\Media\Models;

use Illuminate\Database\Eloquent\Model;

class MediaUsage extends Model
{
    protected $table = 'media_usages';

    protected $fillable = [
        'media_id',
        'usable_type',
        'usable_id',
        'field',
    ];

    public function media()
    {
        return $this->belongsTo(Media::class, 'media_id');
    }

    public function usable()
    {
        return $this->morphTo();
    }
}
