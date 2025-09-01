<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
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
            'post_type' => $this->post_type,
            'is_commentable' => $this->is_commentable,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'author_id' => $this->author_id,
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                    'email' => $this->author->email,
                ];
            }),


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
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'title' => $category->title,
                        'slug' => $category->slug,
                    ];
                });
            }),
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

        ];
    }
}
