<?php

namespace App\Http\Requests;

use App\Enums\Posts\PostStatus;
use App\Enums\Posts\PostType;
use App\Enums\Posts\PostVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class PostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation()
    {
        $this->merge([
            'author_id' => $this->input('author_id') ?? auth()->id(),
            'category_ids' => $this->input('category_ids')
                ? json_decode($this->input('category_ids'), true)
                : null,
            'tag_ids' => $this->input('tag_ids')
                ? json_decode($this->input('tag_ids'), true)
                : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'author_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                // Rule::unique('pages', 'slug')->ignore($page->id),
            ],
            'post_type' => ['required', new Enum(type: PostType::class)],
            'is_commentable' => 'boolean',
            'excerpt' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'thumbnailFile' => 'nullable|image|max:2048',
            'content' => 'nullable|string',
            'featured_media_type' => 'nullable|string|max:255',
            'featured_media_url' => 'nullable|string|max:255',
            'media_source' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => ['required', new Enum(type: PostStatus::class)],
            'visibility' => ['required', new Enum(type: PostVisibility::class)],
            'scheduled_at' => 'nullable|date',
            'published_at' => 'nullable|date',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:post_categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:post_tags,id',
        ];
    }
}
