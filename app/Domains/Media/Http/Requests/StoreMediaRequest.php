<?php

namespace App\Domains\Media\Http\Requests;

use App\Domains\Media\Enums\MediaVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:51200'],
            'disk' => ['nullable', 'string', 'max:50', Rule::in(config('media.allowed_disks', []))],
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'visibility' => ['nullable', new Enum(MediaVisibility::class)],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
