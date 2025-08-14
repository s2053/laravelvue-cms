<?php

namespace App\Models;

use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class PostCategory extends Model
{
    use HasSlug;

    protected $table = "post_categories";
    protected $fillable = [
        'title',
        'slug',
        'description',
    ];
}

