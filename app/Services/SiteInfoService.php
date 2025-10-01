<?php

namespace App\Services;

use App\Models\SiteInfo;
use Illuminate\Http\UploadedFile;
use App\Services\FileUploadService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class SiteInfoService
{
    protected SiteInfo $siteInfo;
    protected FileUploadService $fileUpload;
    protected string $defaultStoragePath = 'site-images';

    protected array $imageFieldsWithVariants = [
        'logo' => [
            'thumb' => [50, 50],
            'medium' => [200, 100],
            'large' => [400, 200],
        ],
        'footer_logo' => [
            'thumb' => [50, 25],
            'medium' => [150, 75],
            'large' => [300, 150],
        ],
        'placeholder_image' => null, // default sizes
    ];

    protected array $imageFieldsOriginalOnly = [
        'favicon'
    ];

    public function __construct(FileUploadService $fileUpload)
    {
        $this->fileUpload = $fileUpload;
        $this->siteInfo = SiteInfo::firstOrCreate([]);
    }

    public function show(): SiteInfo
    {
        return $this->siteInfo;
    }

    /**
     * Update site info atomically with transaction
     */
    public function update(array $data): SiteInfo
    {
        // Keep track of uploaded new files so we can delete them if rollback occurs
        $uploadedFiles = [];

        DB::beginTransaction();

        try {
            // Handle image fields with variants
            foreach ($this->imageFieldsWithVariants as $field => $sizes) {
                $fileKey = $field . '_file';

                // Clear image
                if (array_key_exists($field, $data) && ($data[$field] === null || $data[$field] === '')) {
                    if ($this->siteInfo->$field) {
                        $deleteVariants = is_array($sizes) || $sizes === true;
                        $this->deleteFile($this->siteInfo->$field, $deleteVariants);
                    }
                    $data[$field] = null;
                } else {
                    unset($data[$field]);

                }

                // Upload new image
                if (!empty($data[$fileKey]) && $data[$fileKey] instanceof UploadedFile) {
                    if ($this->siteInfo->$field) {
                        $deleteVariants = is_array($sizes) || $sizes === true;
                        $this->deleteFile($this->siteInfo->$field, $deleteVariants);
                    }
                    $data[$field] = $this->storeFile($data[$fileKey], $sizes !== false, is_array($sizes) ? $sizes : null);
                    $uploadedFiles[] = $data[$field]; // track for rollback
                    unset($data[$fileKey]);
                }
            }

            // Handle original-only images
            foreach ($this->imageFieldsOriginalOnly as $field) {
                $fileKey = $field . '_file';

                if (array_key_exists($field, $data) && ($data[$field] === null || $data[$field] === '')) {
                    if ($this->siteInfo->$field) {
                        $this->deleteFile($this->siteInfo->$field, false);
                    }
                    $data[$field] = null;
                } else {
                    unset($data[$field]);

                }

                if (!empty($data[$fileKey]) && $data[$fileKey] instanceof UploadedFile) {
                    if ($this->siteInfo->$field) {
                        $this->deleteFile($this->siteInfo->$field, false);
                    }
                    $data[$field] = $this->storeFile($data[$fileKey], false);
                    $uploadedFiles[] = $data[$field];
                    unset($data[$fileKey]);
                }
            }

            // Update DB
            $this->siteInfo->update($data);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();

            // Delete newly uploaded files if transaction fails
            foreach ($uploadedFiles as $file) {
                try {
                    $this->deleteFile($file, true);
                } catch (Exception $ex) {
                    Log::warning("Failed to delete uploaded file after rollback: {$file}, error: " . $ex->getMessage());
                }
            }

            Log::error('SiteInfoService update failed: ' . $e->getMessage());
            throw new Exception('Failed to update site info.');
        }

        return $this->siteInfo;
    }

    protected function storeFile(UploadedFile $file, bool $generateVariants = true, ?array $customSizes = null): string
    {
        try {
            return $this->fileUpload->uploadImage(
                $file,
                $this->defaultStoragePath,
                $generateVariants,
                $customSizes
            )['original'];
        } catch (Exception $e) {
            Log::error("Failed to store file {$file->getClientOriginalName()}: " . $e->getMessage());
            throw new Exception('Failed to store uploaded file.');
        }
    }

    protected function deleteFile(string $path, bool $deleteVariants = true): void
    {
        try {
            $this->fileUpload->deleteFiles($path, $deleteVariants);
        } catch (Exception $e) {
            Log::warning("Failed to delete file {$path}: " . $e->getMessage());
        }
    }
}
