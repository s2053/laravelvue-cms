<?php

namespace App\Http\Requests;

use App\Enums\Widgets\ContentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class UpdateWidgetItemsRequest extends FormRequest
{
    private const MAX_DEPTH = 5;

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
            'items' => ['nullable', 'array'],
            'items.*.id' => ['nullable', 'integer'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.url' => ['nullable', 'string', 'max:255'],
            'items.*.icon' => ['nullable', 'string', 'max:255'],
            'items.*.parent_id' => ['nullable', 'integer'],
            'items.*.content_type' => ['nullable', new Enum(ContentType::class)],
            'items.*.content_type_id' => ['nullable', 'integer'],
            'items.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            'items.*.status' => ['nullable', 'boolean'],
            'items.*.children' => ['nullable', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $items = $validator->safe()->input('items', []);

            $this->validateTree($validator, $items);
        });
    }

    /**
     * Recursively validate the submitted menu tree so nested nodes follow the
     * same contract as top-level items.
     *
     * @param array<int, array<string, mixed>> $items
     */
    private function validateTree(Validator $validator, array $items, int $depth = 1, string $path = 'items'): void
    {
        if ($depth > self::MAX_DEPTH) {
            $validator->errors()->add($path, 'Menu nesting cannot exceed ' . self::MAX_DEPTH . ' levels.');
            return;
        }

        foreach ($items as $index => $item) {
            $itemPath = "{$path}.{$index}";

            if (!is_array($item)) {
                $validator->errors()->add($itemPath, 'Each menu item must be a valid object.');
                continue;
            }

            $title = trim((string) ($item['title'] ?? ''));
            if ($title === '') {
                $validator->errors()->add("{$itemPath}.title", 'The title field is required.');
            }

            $contentType = $item['content_type'] ?? null;
            if ($contentType !== null && $contentType !== '' && !in_array($contentType, array_column(ContentType::cases(), 'value'), true)) {
                $validator->errors()->add("{$itemPath}.content_type", 'The selected content type is invalid.');
            }

            $children = $item['children'] ?? [];
            if ($children !== null && !is_array($children)) {
                $validator->errors()->add("{$itemPath}.children", 'Children must be provided as an array.');
                continue;
            }

            if (is_array($children) && $children !== []) {
                $this->validateTree($validator, $children, $depth + 1, "{$itemPath}.children");
            }
        }
    }
}
