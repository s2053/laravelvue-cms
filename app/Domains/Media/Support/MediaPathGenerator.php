<?php

namespace App\Domains\Media\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class MediaPathGenerator
{
    public function makeDirectory(): string
    {
        return 'media/' . now()->format('Y/m');
    }

    public function makeFilename(UploadedFile $file, ?string $extension = null): string
    {
        $extension = $extension ?: strtolower($file->getClientOriginalExtension());

        return Str::uuid()->toString() . ($extension ? '.' . $extension : '');
    }

    public function makePath(string $directory, string $filename): string
    {
        return trim($directory, '/') . '/' . ltrim($filename, '/');
    }

    public function makeVariantPath(string $directory, string $variant, string $filename): string
    {
        return trim($directory, '/') . '/variants/' . trim($variant, '/') . '/' . ltrim($filename, '/');
    }
}
