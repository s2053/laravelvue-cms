<?php

namespace App\Domains\Media\Services;

use App\Domains\Media\Contracts\ImageProcessorContract;
use App\Domains\Media\Contracts\MediaStorageContract;
use App\Domains\Media\Enums\MediaSourceType;
use App\Domains\Media\Enums\MediaType;
use App\Domains\Media\Enums\MediaVisibility;
use App\Domains\Media\Filters\MediaFilter;
use App\Domains\Media\Models\Media;
use App\Domains\Media\Models\MediaVariant;
use App\Domains\Media\Support\MediaPathGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MediaService
{
    public function __construct(
        protected MediaStorageContract $storage,
        protected ImageProcessorContract $imageProcessor,
        protected MediaPathGenerator $pathGenerator,
    ) {
    }

    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = Media::query()->with(['variants', 'creator'])->withCount('usages');

        $filter = new MediaFilter($params);
        $query = $filter->apply($query);

        if ($all) {
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    public function show(Media $media): Media
    {
        return Media::query()
            ->with(['variants', 'creator', 'updater', 'deleter'])
            ->withCount('usages')
            ->findOrFail($media->id);
    }

    public function create(array $data): Media
    {
        /** @var UploadedFile $file */
        $file = $data['file'];

        return DB::transaction(function () use ($data, $file) {
            return $this->storeFile($file, $data);
        });
    }

    public function bulkCreate(array $data)
    {
        $files = $data['files'];

        return DB::transaction(function () use ($files, $data) {
            $records = collect();

            foreach ($files as $file) {
                $records->push($this->storeFile($file, $data));
            }

            return $records;
        });
    }

    public function update(Media $media, array $data): Media
    {
        $updatable = ['title', 'alt_text', 'caption', 'description', 'visibility', 'status'];
        $payload = ['updated_by' => auth()->id()];

        foreach ($updatable as $field) {
            if (array_key_exists($field, $data)) {
                $payload[$field] = $data[$field];
            }
        }

        $media->update($payload);

        return $media->load(['variants', 'creator', 'updater']);
    }

    public function delete(Media $media): void
    {
        if ($media->usages()->exists()) {
            throw ValidationException::withMessages([
                'media' => 'This media asset is still in use and cannot be deleted.',
            ]);
        }

        DB::transaction(function () use ($media) {
            $this->deleteRecord($media);
        });
    }

    public function bulkUpdate(array $validated): array
    {
        $mediaQuery = Media::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $records = $mediaQuery->with(['variants', 'usages'])->get();

                if ($records->contains(fn (Media $record) => $record->usages->isNotEmpty())) {
                    throw ValidationException::withMessages([
                        'media' => 'One or more selected media assets are still in use and cannot be deleted.',
                    ]);
                }

                DB::transaction(function () use ($records) {
                    foreach ($records as $record) {
                        $this->deleteRecord($record);
                    }
                });

                return ['message' => 'Media deleted.'];

            case 'status':
                $mediaQuery->update([
                    'status' => $validated['data']['status'],
                    'updated_by' => auth()->id(),
                ]);

                return ['message' => 'Media status updated.'];

            case 'visibility':
                $mediaQuery->update([
                    'visibility' => $validated['data']['visibility'],
                    'updated_by' => auth()->id(),
                ]);

                return ['message' => 'Media visibility updated.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }

    protected function resolveType(UploadedFile $file): MediaType
    {
        $mime = $file->getMimeType() ?: '';

        return match (true) {
            str_starts_with($mime, 'image/') => MediaType::IMAGE,
            str_starts_with($mime, 'video/') => MediaType::VIDEO,
            str_starts_with($mime, 'audio/') => MediaType::AUDIO,
            str_contains($mime, 'pdf'),
            str_contains($mime, 'document'),
            str_contains($mime, 'spreadsheet'),
            str_contains($mime, 'presentation'),
            str_starts_with($mime, 'text/') => MediaType::DOCUMENT,
            default => MediaType::FILE,
        };
    }

    protected function inspectGenericFile(UploadedFile $file): array
    {
        return [
            'width' => null,
            'height' => null,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'extension' => strtolower($file->getClientOriginalExtension()),
        ];
    }

    protected function createImageVariants(Media $media, UploadedFile $file): void
    {
        $generated = $this->imageProcessor->generateVariants($file, $this->getImageVariants());

        foreach ($generated as $variant => $payload) {
            $variantFilename = pathinfo($media->filename, PATHINFO_FILENAME)
                . '-' . $variant
                . '.'
                . $payload['extension'];
            $variantPath = $this->pathGenerator->makeVariantPath($media->directory, $variant, $variantFilename);

            $this->storage->storeContents($media->disk, $variantPath, $payload['contents']);

            MediaVariant::create([
                'media_id' => $media->id,
                'variant' => $variant,
                'disk' => $media->disk,
                'path' => $variantPath,
                'filename' => $variantFilename,
                'mime_type' => $payload['mime_type'],
                'extension' => $payload['extension'],
                'size' => $payload['size'],
                'width' => $payload['width'],
                'height' => $payload['height'],
            ]);
        }
    }

    protected function storeFile(UploadedFile $file, array $data): Media
    {
        $disk = $data['disk'] ?? config('media.default_disk', 'public');
        $directory = $this->pathGenerator->makeDirectory();
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = $this->pathGenerator->makeFilename($file, $extension);
        $path = $this->pathGenerator->makePath($directory, $filename);
        $type = $this->resolveType($file);
        $meta = $type === MediaType::IMAGE
            ? $this->imageProcessor->inspect($file)
            : $this->inspectGenericFile($file);

        $this->storage->storeUploadedFile($file, $disk, $path);

        $media = Media::create([
            'source_type' => MediaSourceType::UPLOAD,
            'type' => $type,
            'disk' => $disk,
            'directory' => $directory,
            'path' => $path,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'extension' => $meta['extension'],
            'mime_type' => $meta['mime_type'],
            'size' => $meta['size'],
            'width' => $meta['width'],
            'height' => $meta['height'],
            'title' => $data['title'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'alt_text' => $data['alt_text'] ?? null,
            'caption' => $data['caption'] ?? null,
            'description' => $data['description'] ?? null,
            'visibility' => $data['visibility'] ?? MediaVisibility::PUBLIC,
            'status' => $data['status'] ?? true,
            'created_by' => auth()->id(),
        ]);

        if ($type === MediaType::IMAGE) {
            $this->createImageVariants($media, $file);
        }

        return $media->load(['variants', 'creator']);
    }

    /**
     * @return array<string, array{0:int,1:int}>
     */
    protected function getImageVariants(): array
    {
        return config('media.variants.image', [
            'thumb' => [150, 150],
            'small' => [300, 300],
            'medium' => [768, 768],
            'large' => [1440, 1440],
        ]);
    }

    protected function deleteRecord(Media $media): void
    {
        foreach ($media->variants as $variant) {
            $this->storage->delete($variant->disk, $variant->path);
        }

        $this->storage->delete($media->disk, $media->path);

        $media->deleted_by = auth()->id();
        $media->save();
        $media->delete();
    }
}
