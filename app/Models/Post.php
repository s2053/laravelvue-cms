<?php

namespace App\Models;

use App\Enums\Posts\PostStatus;
use App\Enums\Posts\PostType;
use App\Enums\Posts\PostVisibility;
use App\Traits\HasImageUrls;
use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasSlug;
    use HasImageUrls;


    protected $fillable = [
        'title',
        'slug',
        'page_type',
        'is_commentable',
        'excerpt',
        'content',
        'thumbnail',
        'featured_media_type',
        'featured_media',
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
        'post_type' => PostType::class,
        'status' => PostStatus::class,
        'visibility' => PostVisibility::class,


        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',

    ];



    public function category()
    {
        return $this->belongsTo(PageCategory::class, 'page_category_id');
    }
}
