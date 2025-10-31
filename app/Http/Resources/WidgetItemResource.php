<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WidgetItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'url' => $this->url,
            'order' => $this->ordernum,
            'target' => $this->target,
            'icon' => $this->icon,
            'content_type' => $this->content_type,
            'content_type_id' => $this->content_type_id,
            'parent_id' => $this->parent_id,
            'children' => WidgetItemResource::collection($this->whenLoaded('children')),
        ];
    }
}
