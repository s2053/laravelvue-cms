<?php

namespace App\Domains\Media\Services;

use App\Domains\Media\Contracts\ImageProcessorContract;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Laravel\Facades\Image;

class InterventionImageProcessorService implements ImageProcessorContract
{
    public function inspect(UploadedFile $file): array
    {
        $image = Image::read($file->getRealPath());

        return [
            'width' => $image->width(),
            'height' => $image->height(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'extension' => strtolower($file->getClientOriginalExtension()),
        ];
    }

    public function generateVariants(UploadedFile $file, array $variants): array
    {
        $generated = [];

        foreach ($variants as $variant => [$width, $height]) {
            $image = Image::read($file->getRealPath());
            $image->scaleDown($width, $height);

            $contents = (string) $image->encode();

            $generated[$variant] = [
                'contents' => $contents,
                'width' => $image->width(),
                'height' => $image->height(),
                'mime_type' => $file->getMimeType() ?: 'image/' . strtolower($file->getClientOriginalExtension()),
                'extension' => strtolower($file->getClientOriginalExtension()),
                'size' => strlen($contents),
            ];
        }

        return $generated;
    }
}
