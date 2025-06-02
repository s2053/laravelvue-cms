<?php

namespace App\Models;

use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class PageCategory extends Model
{
    use HasSlug;
    protected $fillable = [
        'title',
        'slug',
        'description',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status',
    ];


    protected $casts = [
        'status' => 'boolean',
    ];
}
