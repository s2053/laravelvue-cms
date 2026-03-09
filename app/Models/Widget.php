<?php

namespace App\Models;

use App\Enums\Widgets\MenuLocation;
use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class Widget extends Model
{
    use HasSlug;

    protected $fillable = [
        'title',
        'description',
        'widget_type',   // menu, collection, custom
        'content_type',  // posts, pages
        'nestable',
        'settings',
        'slug',
        'location',
        'icon',
        'is_default',
        'status',
    ];

    protected $casts = [
        'nestable' => 'boolean',
        'settings' => 'array',
        'location' => MenuLocation::class,
        'is_default' => 'boolean',
        'status' => 'boolean',
    ];


    public function items()
    {
        return $this->hasMany(WidgetItem::class, 'widget_id');
    }
}
