<?php

namespace App\Services;

use App\Enums\PageStatus;
use App\Filters\PageFilter;
use App\Models\Page;
use Illuminate\Http\UploadedFile;
use App\Services\FileUploadService;

class PageService
{
    protected string $defaultStoragePath = 'pages';
    protected FileUploadService $fileUpload;

    public function __construct(FileUploadService $fileUpload)
    {
        $this->fileUpload = $fileUpload;
    }

    /**
     * List pages with optional filters and pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = Page::with('category');
        $filter = new PageFilter($params);
        $query = $filter->apply($query);

        if ($all) {
            if ($perPage > 0) {
                return $query->take($perPage)->get();
            }
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new page.
     *
     * @param array $data
     * @return Page
     */
    public function create(array $data): Page
    {
        if (!empty($data['thumbnailFile']) && $data['thumbnailFile'] instanceof UploadedFile) {
            $data['thumbnail'] = $this->storeFile($data['thumbnailFile']);
            unset($data['thumbnailFile']);
        }

        $data['created_by'] = auth()->id();

        return Page::create($data);
    }

    /**
     * Get a specific page with its category.
     *
     * @param Page $page
     * @return Page
     */
    public function show(Page $page): Page
    {
        return $page->load('category');
    }

    /**
     * Get a page by its ID with its category.
     *
     * @param int $id
     * @return Page
     */
    public function showById(int $id): Page
    {
        return Page::with('category')->findOrFail($id);
    }

    /**
     * Update an existing page.
     *
     * @param Page $page
     * @param array $data
     * @return Page
     */
    public function update(Page $page, array $data): Page
    {

        // Handle thumbnail clearing
        if (array_key_exists('thumbnail', $data) && ($data['thumbnail'] === null || $data['thumbnail'] === '')) {
            if ($page->thumbnail) {
                $this->deleteFile($page->thumbnail);
            }
            $data['thumbnail'] = null;
        } else {
            unset($data['thumbnail']);
        }

        // Handle new thumbnail upload
        if (!empty($data['thumbnailFile']) && $data['thumbnailFile'] instanceof UploadedFile) {
            if ($page->thumbnail) {
                $this->deleteFile($page->thumbnail);
            }
            $data['thumbnail'] = $this->storeFile($data['thumbnailFile']);
            unset($data['thumbnailFile']);
        }

        $data['updated_by'] = auth()->id();
        $page->update($data);

        return $page;
    }

    /**
     * Delete a page and its thumbnail.
     *
     * @param Page $page
     * @return void
     */
    public function delete(Page $page): void
    {
        if ($page->thumbnail) {
            $this->deleteFile($page->thumbnail);
        }

        $page->deleted_by = auth()->id();
        $page->save();
        $page->delete();
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

    /**
     * Bulk update pages.
     *
     * @param array $validated
     * @return array
     */
    public function bulkUpdate(array $validated): array
    {
        $pages = Page::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $pages = $pages->get();
                foreach ($pages as $page) {
                    $this->delete($page);
                }
                return ['message' => 'Pages deleted.'];

            case 'status':
                $data = $validated['data'];
                $status = PageStatus::tryFrom($data['status']);
                $scheduled_at = null;

                if ($status == PageStatus::SCHEDULED) {
                    $scheduled_at = $data['scheduled_at'] ?? now()->addHours(4);
                    $pages->update([
                        'status' => PageStatus::SCHEDULED,
                        'scheduled_at' => $scheduled_at,
                    ]);
                } elseif ($status == PageStatus::PUBLISHED) {
                    $published_at = $data['published_at'] ?? now();
                    $pages->update([
                        'status' => PageStatus::PUBLISHED,
                        'published_at' => $published_at,
                    ]);
                } elseif ($status == PageStatus::ARCHIVED) {
                    $pages->where('status', PageStatus::PUBLISHED)
                        ->update(['status' => PageStatus::ARCHIVED]);
                } else {
                    $pages->update([
                        'status' => PageStatus::DRAFT,
                        'scheduled_at' => $scheduled_at,
                    ]);
                }
                return ['message' => 'Status updated.'];

            case 'page_category_id':
                $pages->update(['page_category_id' => $validated['data']['page_category_id']]);
                return ['message' => 'Category updated.'];

            case 'visibility':
                $pages->update(['visibility' => $validated['data']['visibility']]);
                return ['message' => 'Visibility updated.'];

            case 'page_type':
                $pages->update(['page_type' => $validated['data']['page_type']]);
                return ['message' => 'Page Type updated.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }

    /**
     * Get the storage path for files.
     *
     * @return string
     */
    protected function getStoragePath(): string
    {
        return $this->defaultStoragePath;
    }


}
