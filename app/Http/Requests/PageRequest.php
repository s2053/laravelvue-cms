<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

use App\Enums\PageStatus;
use App\Enums\PageType;
use App\Enums\PageVisibility;

class PageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                // Rule::unique('pages', 'slug')->ignore($page->id),
            ],
            'page_type' => ['required', new Enum(type: PageType::class)],
            'is_commentable' => 'boolean',
            'excerpt' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'thumbnailFile' => 'nullable|image|max:2048',
            'body' => 'nullable|string',
            'featured_media_type' => 'nullable|string|max:255',
            'featured_media_url' => 'nullable|string|max:255',
            'media_source' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => ['required', new Enum(type: PageStatus::class)],
            'visibility' => ['required', new Enum(type: PageVisibility::class)],
            'scheduled_at' => 'nullable|date',
            'published_at' => 'nullable|date',
            'page_category_id' => 'nullable|exists:page_categories,id',
        ];
    }
}
