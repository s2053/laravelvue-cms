<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Interfaces\ImageInterface;
use Illuminate\Support\Str;

/**
 * Service to handle file and image uploads, resizing, and deletions.
 */
class FileUploadService
{
    protected string $disk;
    protected string $basePath;
    protected string $originalFolder = 'original';

    /**
     * Default image sizes [folder_name => [width, height]]
     */
    protected array $defaultImageSizes = [
        'thumb' => [150, 150],
        'medium' => [600, 400],
        'large' => [1200, 900],
    ];

    /**
     * @param string $disk Storage disk (e.g., 'public')
     * @param string $basePath Base path inside disk (e.g., 'uploads')
     */
    public function __construct(string $disk = 'public', string $basePath = 'uploads')
    {
        $this->disk = $disk;
        $this->basePath = trim($basePath, '/');
    }

    /**
     * Uploads an image and optionally generates resized versions.
     *
     * @param UploadedFile $file
     * @param string $folder Subfolder inside base path
     * @param bool $generateSizes Whether to generate variants
     * @param array|null $sizes Custom sizes [name => [w,h]]
     * @param string|null $originalFolder Folder name to store original image if resizing
     * @param string|null $filename Optional custom filename
     * @return array ['original' => path, 'thumb' => path, ...]
     */
    public function uploadImage(
        UploadedFile $file,
        string $folder = '',
        bool $generateSizes = true,
        ?array $sizes = null,
        ?string $originalFolder = null,
        ?string $filename = null,
    ): array {
        $originalFolder = $originalFolder ?? $this->originalFolder;
        $sizes = $sizes ?? $this->defaultImageSizes;
        $folder = trim($folder, '/');
        $filename = $filename ?? $this->generateFileName($file);
        $fullFolderPath = $this->buildFolderPath($folder);

        // Determine original image path
        $originalPath = $generateSizes
            ? "{$fullFolderPath}/{$originalFolder}/{$filename}"
            : "{$fullFolderPath}/{$filename}";

        // Save original
        $image = Image::read($file->getRealPath());
        $this->storeImage($image, $originalPath);

        $paths = [$generateSizes ? $originalFolder : 'original' => $originalPath];

        // Generate resized versions if needed
        if ($generateSizes) {
            foreach ($sizes as $key => [$width, $height]) {
                $resizedImage = Image::read($file->getRealPath());
                $resizedImage->scaleDown($width, $height);
                $resizedPath = "{$fullFolderPath}/{$key}/{$filename}";

                $this->storeImage($resizedImage, $resizedPath);
                $paths[$key] = $resizedPath;
            }
        }

        return $paths;
    }

    /**
     * Uploads a generic file (non-image).
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string|null $filename
     * @return string Stored file path
     */
    public function uploadFile(
        UploadedFile $file,
        string $folder = '',
        ?string $filename = null
    ): string {
        $folder = trim($folder, '/');
        $filename = $filename ?? $this->generateFileName($file);
        $fullPath = "{$this->buildFolderPath($folder)}/{$filename}";

        Storage::disk($this->disk)->putFileAs($this->buildFolderPath($folder), $file, $filename);

        return $fullPath;
    }

    /**
     * Deletes original file and optionally its resized variants.
     *
     * @param string|array $paths
     * @param bool $deleteVariants
     * @param array|null $sizes
     * @param string|null $originalFolder
     * @return void
     */
    public function deleteFiles(
        string|array $paths,
        bool $deleteVariants = true,
        ?array $sizes = null,
        ?string $originalFolder = null
    ): void {
        $paths = (array) $paths;
        $sizes = $sizes ?? array_keys($this->defaultImageSizes);
        $originalFolder = $originalFolder ?? $this->originalFolder;
        $storage = Storage::disk($this->disk);

        foreach ($paths as $path) {
            if ($storage->exists($path)) {
                $storage->delete($path);
            }

            if ($deleteVariants) {
                foreach ($sizes as $size) {
                    $resizedPath = str_replace("/{$originalFolder}/", "/{$size}/", $path);
                    if ($storage->exists($resizedPath)) {
                        $storage->delete($resizedPath);
                    }
                }
            }
        }
    }

    /**
     * Generate a random, unique file name with extension.
     */
    protected function generateFileName(UploadedFile $file): string
    {
        return Str::random(20) . '.' . $file->getClientOriginalExtension();
    }

    /**
     * Build full storage path inside the base directory.
     */
    protected function buildFolderPath(string $folder): string
    {
        return $folder === '' ? $this->basePath : "{$this->basePath}/{$folder}";
    }

    /**
     * Store an Intervention image on disk.
     *
     * @param ImageInterface $image
     * @param string $path
     */
    protected function storeImage(ImageInterface $image, string $path): void
    {
        Storage::disk($this->disk)->put($path, (string) $image->encode());
    }
}
