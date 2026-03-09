<?php

namespace App\Http\Requests;

use App\Enums\Widgets\MenuLocation;
use App\Enums\Widgets\WidgetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class WidgetLocationRequest extends FormRequest
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
            'location' => [
                'nullable',
                new Enum(MenuLocation::class),
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $widget = $this->route('widget');

            if ($widget && $widget->widget_type !== WidgetType::MENU->value) {
                $validator->errors()->add('location', 'Only menu widgets can have a location.');
            }
        });
    }
}
