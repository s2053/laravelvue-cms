<?php

namespace App\Services\Posts;

use App\Filters\CategoryFilter;
use App\Models\PostCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\FileUploadService;
class PostCategoryService
{

    protected string $defaultStoragePath = 'post-categories';
    protected FileUploadService $fileUpload;

    public function __construct(FileUploadService $fileUpload)
    {
        $this->fileUpload = $fileUpload;
    }


    /**
     * List post categories with optional pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return LengthAwarePaginator|Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = PostCategory::with('parent');

        $filter = new CategoryFilter($params);
        $query = $filter->apply($query);

        if ($all) {
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new post category.
     */
    public function create(array $data): PostCategory
    {
        if (!empty($data['featured_image_file']) && $data['featured_image_file'] instanceof UploadedFile) {
            $data['featured_image'] = $this->storeFile($data['featured_image_file']);
            unset($data['featured_image_file']);
        }
        return PostCategory::create($data);
    }

    /**
     * Get a specific post category.
     */
    public function show(PostCategory $record): PostCategory
    {
        return $record;
    }

    /**
     * Update an existing post category.
     */
    public function update(PostCategory $record, array $data): PostCategory
    {

        // Handle featured image clearing
        if (array_key_exists('featured_image', $data) && ($data['featured_image'] === null || $data['featured_image'] === '')) {
            if ($record->featured_image) {
                $this->deleteFile($record->featured_image);
            }
            $data['featured_image'] = null;
        } else {
            unset($data['featured_image']);
        }

        // Handle new featured image upload
        if (!empty($data['featured_image_file']) && $data['featured_image_file'] instanceof UploadedFile) {
            if ($record->featured_image) {
                $this->deleteFile($record->featured_image);
            }
            $data['featured_image'] = $this->storeFile($data['featured_image_file']);
            unset($data['featured_image_file']);
        }


        $record->update($data);
        return $record;
    }

    /**
     * Delete a post category.
     */
    public function delete(PostCategory $record): void
    {
        $record->delete();
    }



    /**
     * Get categories for dropdown or search.
     *
     * @param string|null $search
     * @param bool $all
     * @return \Illuminate\Support\Collection
     */
    public function getOptions(?string $search = null, bool $all = false)
    {
        $query = PostCategory::query();

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $categories = $all ? $query->get() : $query->limit(20)->get();

        return $categories->map(fn($c) => [
            'id' => $c->id,
            'title' => $c->title,
            'parent_id' => $c->parent_id
        ]);
    }

    /**
     * Bulk update or delete.
     */
    public function bulkUpdate(array $validated): array
    {
        $recs = PostCategory::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $recs = $recs->get();
                foreach ($recs as $rec) {
                    $this->delete($rec);
                }
                return ['message' => 'Pages deleted.'];

            case 'status':
                $data = $validated['data'];
                $recs->update([
                    'status' => $data['status']
                ]);
                return ['message' => 'Status updated.'];



            default:
                return ['message' => 'Invalid action'];
        }
    }



    /**
     * Store an uploaded file and return its path.
     *
     * @param UploadedFile $file
     * @param string|null $path
     * @return string
     */
    protected function storeFile(UploadedFile $file, ?string $path = null): string
    {
        $path = $path ?? $this->getStoragePath();
        $paths = $this->fileUpload->uploadImage($file, $path, true);
        return $paths['original'];
    }

    /**
     * Delete a file and its variants.
     *
     * @param string $path
     * @return void
     */
    protected function deleteFile(string $path): void
    {
        $this->fileUpload->deleteFiles($path);
    }

    protected function getStoragePath(): string
    {
        return $this->defaultStoragePath;
    }
}
