<?php

namespace App\Domains\Media\Http\Requests;

use App\Domains\Media\Enums\MediaVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class BulkUpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'string', 'in:delete,status,visibility'],
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:media,id'],
            'data' => ['nullable', 'array'],
            'data.status' => [
                Rule::requiredIf(fn () => $this->input('action') === 'status'),
                'boolean',
            ],
            'data.visibility' => [
                Rule::requiredIf(fn () => $this->input('action') === 'visibility'),
                new Enum(MediaVisibility::class),
            ],
        ];
    }
}
