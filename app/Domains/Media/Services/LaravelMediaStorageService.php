<?php

namespace App\Domains\Media\Services;

use App\Domains\Media\Contracts\MediaStorageContract;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class LaravelMediaStorageService implements MediaStorageContract
{
    public function storeUploadedFile(UploadedFile $file, string $disk, string $path): string
    {
        Storage::disk($disk)->putFileAs(dirname($path), $file, basename($path));

        return $path;
    }

    public function storeContents(string $disk, string $path, string $contents): string
    {
        Storage::disk($disk)->put($path, $contents);

        return $path;
    }

    public function delete(?string $disk, ?string $path): void
    {
        if (!$disk || !$path) {
            return;
        }

        $storage = Storage::disk($disk);

        if ($storage->exists($path)) {
            $storage->delete($path);
        }
    }

    public function url(?string $disk, ?string $path): ?string
    {
        if (!$disk || !$path) {
            return null;
        }

        return Storage::disk($disk)->url($path);
    }
}
