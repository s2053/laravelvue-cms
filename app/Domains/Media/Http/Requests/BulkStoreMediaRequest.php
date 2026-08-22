<?php

namespace App\Domains\Media\Http\Requests;

use App\Domains\Media\Enums\MediaVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class BulkStoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowedExtensions = implode(',', config('media.allowed_extensions', []));

        return [
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'max:51200', 'mimes:' . $allowedExtensions],
            'disk' => ['nullable', 'string', 'max:50', Rule::in(config('media.allowed_disks', []))],
            'visibility' => ['nullable', new Enum(MediaVisibility::class)],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
