<?php
namespace App\Traits;

trait HasImageUrls
{
    /**
     * Generate a full image URL based on the raw image path and desired size.
     *
     * @param string|null $path  The image path (e.g., 'uploads/pages/original/abc.jpg')
     * @param string $size       Desired size folder ('original', 'thumb', 'medium', etc.)
     * @return string|null
     */
    public function makeImageUrl(?string $path, string $size = null): ?string
    {
        if (!$path) {
            return null;
        }

        if($size == null){
             asset("storage/{$path}");
        }

        return $size === 'original'
            ? asset("storage/{$path}")
            : asset(str_replace('/original/', "/{$size}/", "storage/{$path}"));
    }
}
