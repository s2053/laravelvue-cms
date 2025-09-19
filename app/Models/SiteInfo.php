<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteInfo extends Model
{
    protected $fillable = [
        'site_title',
        'tagline',
        'logo',
        'favicon',
        'footer_logo',
        'placeholder_image',

        'contact_email',
        'contact_phone',
        'contact_mobile',
        'address',
        'google_map_iframe',
        'social_links',

        'meta_title',
        'meta_description',

        'cookies_enabled',
        'cookies_text',
        'copyright_text',
    ];

    protected $casts = [
        'cookies_enabled' => 'boolean',
        'social_links' => 'array',
    ];

}
