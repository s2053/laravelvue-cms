<?php

namespace App\Models;

use App\Enums\PageStatus;
use App\Enums\PageType;
use App\Enums\PageVisibility;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasSlug;

class Page extends Model
{
    use HasSlug;

    protected $fillable = [
        'title',
        'slug',
        'page_category_id',
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
        'visibility',
        'scheduled_at',
        'published_at',
        'created_by',
        'updated_by',
        'deleted_by',
    ];


    protected $casts = [
        'is_commentable' => 'boolean',
        'page_type' => PageType::class,
        'status' => PageStatus::class,
        'visibility' => PageVisibility::class,

    ];



    public function category()
    {
        return $this->belongsTo(PageCategory::class, 'page_category_id');
    }
}
