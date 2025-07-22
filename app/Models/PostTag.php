<?php

namespace App\Models;

use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class PostTag extends Model
{
    use HasSlug;

    protected $table = "post_tags";
    protected $fillable = [
        'title',
        'slug',
        'description',
    ];
}
