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

    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_tag_pivot', 'tag_id', 'post_id');
    }
}
