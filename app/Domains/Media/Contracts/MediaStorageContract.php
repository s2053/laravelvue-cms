<?php

namespace App\Domains\Media\Contracts;

use Illuminate\Http\UploadedFile;

interface MediaStorageContract
{
    public function storeUploadedFile(UploadedFile $file, string $disk, string $path): string;

    public function storeContents(string $disk, string $path, string $contents): string;

    public function delete(?string $disk, ?string $path): void;

    public function url(?string $disk, ?string $path): ?string;
}
