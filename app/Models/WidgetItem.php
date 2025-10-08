<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WidgetItem extends Model
{
    protected $fillable = [
        'widget_id',
        'title',
        'link',
        'content_type',
        'content_type_id',
        'target',
        'status',
        'parent_id',
        'icon',
        'color',
        'cssclass',
        'ordernum',
    ];

    protected $casts = [
        'status' => 'boolean',
        'parent_id' => 'integer',
        'ordernum' => 'integer',
    ];

    public function widget()
    {
        return $this->belongsTo(Widget::class, 'widget_id');
    }
}
