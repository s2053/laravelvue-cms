<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\HasImageUrls;

class SiteInfoResource extends JsonResource
{
    use HasImageUrls;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Branding
            'site_title' => $this->site_title,
            'tagline' => $this->tagline,
            'logo' => $this->logo ? $this->makeImageUrl($this->logo, 'medium') : null,
            'footer_logo' => $this->footer_logo ? $this->makeImageUrl($this->footer_logo, 'medium') : null,
            'placeholder_image' => $this->placeholder_image ? $this->makeImageUrl($this->placeholder_image, 'medium') : null,
            'favicon' => $this->favicon ? $this->makeImageUrl($this->favicon, 'original') : null,

            // Contact
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'contact_mobile' => $this->contact_mobile,
            'address' => $this->address,
            'google_map_iframe' => $this->google_map_iframe,
            'social_links' => $this->social_links,

            // SEO
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,

            // Cookies & Legal
            'cookies_enabled' => $this->cookies_enabled,
            'cookies_text' => $this->cookies_text,
            'copyright_text' => $this->copyright_text,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
