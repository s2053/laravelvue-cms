<?php

namespace App\Domains\Media\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MediaVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'variant' => $this->variant,
            'disk' => $this->disk,
            'path' => $this->path,
            'url' => $this->path ? Storage::disk($this->disk)->url($this->path) : null,
            'filename' => $this->filename,
            'mime_type' => $this->mime_type,
            'extension' => $this->extension,
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
