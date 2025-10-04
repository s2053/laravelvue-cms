<?php

namespace App\Http\Requests;

use App\Enums\Widgets\ContentType;
use App\Enums\Widgets\WidgetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class WidgetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
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
            'description' => 'nullable|string',
            'widget_type' => ['required', new Enum(WidgetType::class)], // e.g. menu, collection, custom
            'content_type' => ['nullable', new Enum(ContentType::class)], // e.g. posts, pages
            'nestable' => 'boolean',
            'settings' => 'nullable|array',
            'slug' => 'nullable|string|max:255|unique:widgets,slug,' . $this->id,
            'icon' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'status' => 'boolean',
        ];
    }
}
