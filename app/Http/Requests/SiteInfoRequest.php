<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiteInfoRequest extends FormRequest
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
            'site_title' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,svg,gif|max:5120',
            'footer_logo_file' => 'nullable|image|mimes:jpeg,png,jpg,svg,gif|max:5120',
            'placeholder_image_file' => 'nullable|image|mimes:jpeg,png,jpg,svg,gif|max:5120',
            'favicon_file' => 'nullable|image|mimes:ico,png|max:1024',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:30',
            'contact_mobile' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'google_map_iframe' => 'nullable|string',

            'social_links' => 'nullable|array',
            'social_links.*.title' => 'required_with:social_links|string|max:50',
            'social_links.*.url' => 'required_with:social_links|url|max:255',

            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',

            'cookies_enabled' => 'nullable|boolean',
            'cookies_text' => 'nullable|string',
            'copyright_text' => 'nullable|string|max:255',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Decode social_links if sent as JSON string
        if ($this->has('social_links') && is_string($this->social_links)) {
            $decoded = json_decode($this->social_links, true);
            $this->merge([
                'social_links' => is_array($decoded) ? $decoded : [],
            ]);
        }

        // Cast cookies_enabled to boolean
        if ($this->has('cookies_enabled')) {
            $this->merge([
                'cookies_enabled' => filter_var($this->cookies_enabled, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
