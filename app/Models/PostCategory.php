<?php

namespace App\Models;

use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class PostCategory extends Model
{
    use HasSlug;
    protected $fillable = [
        'title',
        'slug',
        'description',
        'meta_title',
        'meta_description',
        'status',
        'parent_id',
        'sort_order',
        'featured_image',
        'created_by',
        'updated_by',
        'deleted_by',
    ];


    protected $casts = [
        'status' => 'boolean',
    ];


    public function parent()
    {
        return $this->belongsTo(PostCategory::class, 'parent_id');
    }

    // Optional: child categories
    public function children()
    {
        return $this->hasMany(PostCategory::class, 'parent_id');
    }
}

