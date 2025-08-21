<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PostCategoryRequest extends FormRequest
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
        $editingId = $this->route('post_category')?->id;

        return [
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
            ],
            'description' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'featured_image_file' => 'nullable|image|max:2048',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'status' => 'boolean',
            'parent_id' => [
                'nullable',
                'integer',
                'exists:post_categories,id',
                $editingId ? Rule::notIn([$editingId]) : null,
            ],
            'sort_order' => 'nullable|integer|min:0',
        ];

    }
}

