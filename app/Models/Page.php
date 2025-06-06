<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasSlug;

class Page extends Model
{
    use HasSlug;

    protected $fillable = [
        'title',
        'slug',
        'page_type',
        'is_commentable',
        'excerpt',
        'body',
        'thumbnail',
        'featured_media_type',
        'featured_media_url',
        'media_source',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status',
        'scheduled_at',
        'published_at',
        'created_by',
        'updated_by',
        'deleted_by',
    ];


    protected $casts = [
        'status' => 'boolean',
    ];
}
