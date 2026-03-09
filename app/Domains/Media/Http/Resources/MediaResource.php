<?php

namespace App\Domains\Media\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'source_type' => $this->source_type,
            'type' => $this->type,
            'disk' => $this->disk,
            'directory' => $this->directory,
            'path' => $this->path,
            'url' => $this->path ? Storage::disk($this->disk)->url($this->path) : null,
            'filename' => $this->filename,
            'original_name' => $this->original_name,
            'extension' => $this->extension,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
            'duration' => $this->duration,
            'title' => $this->title,
            'alt_text' => $this->alt_text,
            'caption' => $this->caption,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'status' => (bool) $this->status,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'deleted_by' => $this->deleted_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'updater' => $this->whenLoaded('updater', function () {
                if (!$this->updater) {
                    return null;
                }

                return [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                    'email' => $this->updater->email,
                ];
            }),
            'variants' => MediaVariantResource::collection($this->whenLoaded('variants')),
            'usages_count' => $this->whenCounted('usages'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
