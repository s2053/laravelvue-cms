<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the role ID from the route, whether it's the model or just an ID
        $roleId = $this->route('role')?->id ?? $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                // Unique name, ignore current role ID on update
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
