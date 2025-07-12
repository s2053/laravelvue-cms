<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'page_type' => $this->page_type,
            'is_commentable' => $this->is_commentable,
            'excerpt' => $this->excerpt,
            'body' => $this->body,



            'thumbnail' => $this->thumbnail ? $this->makeImageUrl($this->thumbnail, 'thumb') : null,

            'featured_media_type' => $this->featured_media_type,
            'featured_media_url' => $this->featured_media_url,
            'media_source' => $this->media_source,

            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,

            'status' => $this->status,
            'visibility' => $this->visibility,
            'scheduled_at' => $this->scheduled_at,
            'published_at' => $this->published_at,
            'page_category_id' => $this->page_category_id !== null ? (int) $this->page_category_id : null,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'title' => $this->category->title,
                    'slug' => $this->category->slug,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

        ];
    }
}
