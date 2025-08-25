<?php

namespace App\Services\Posts;

use App\Enums\Posts\PostStatus;
use App\Filters\PostFilter;
use App\Models\Post;
use Illuminate\Http\UploadedFile;
use App\Services\FileUploadService;

class PostService
{
    protected string $defaultStoragePath = 'posts';
    protected FileUploadService $fileUpload;

    public function __construct(FileUploadService $fileUpload)
    {
        $this->fileUpload = $fileUpload;
    }

    /**
     * List posts with optional filters and pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = Post::with(['categories', 'tags']);
        $filter = new PostFilter($params);
        $query = $filter->apply($query);

        return $all ? $query->get() : $query->paginate($perPage);
    }

    /**
     * Create a new post.
     *
     * @param array $data
     * @return Post
     */
    public function create(array $data): Post
    {
        if (!empty($data['thumbnailFile']) && $data['thumbnailFile'] instanceof UploadedFile) {
            $data['thumbnail'] = $this->storeFile($data['thumbnailFile']);
            unset($data['thumbnailFile']);
        }

        $data['created_by'] = auth()->id();

        $post = Post::create($data);

        // Update categories only if key exists in request
        if (array_key_exists('category_ids', $data)) {
            // If it's empty array, sync empty; otherwise sync IDs
            $post->categories()->sync($data['category_ids'] ?? []);
        }

        // Update tags only if key exists in request
        if (array_key_exists('tag_ids', $data)) {
            $post->tags()->sync($data['tag_ids'] ?? []);
        }


        return $post->load(['categories', 'tags']);

    }
    /**
     * Get a specific post with its category.
     *
     * @param Post $post
     * @return Post
     */
    public function show(Post $post): Post
    {
        return $post->load(['categories', 'tags']);
    }

    /**
     * Get a post by its ID with its category.
     *
     * @param int $id
     * @return Post
     */
    public function showById(int $id): Post
    {
        return Post::with(['categories', 'tags'])->findOrFail($id);
    }

    /**
     * Update an existing post.
     *
     * @param Post $post
     * @param array $data
     * @return Post
     */
    public function update(Post $post, array $data): Post
    {

        // Handle thumbnail clearing
        if (array_key_exists('thumbnail', $data) && ($data['thumbnail'] === null || $data['thumbnail'] === '')) {
            if ($post->thumbnail) {
                $this->deleteFile($post->thumbnail);
            }
            $data['thumbnail'] = null;
        } else {
            unset($data['thumbnail']);
        }

        // Handle new thumbnail upload
        if (!empty($data['thumbnailFile']) && $data['thumbnailFile'] instanceof UploadedFile) {
            if ($post->thumbnail) {
                $this->deleteFile($post->thumbnail);
            }
            $data['thumbnail'] = $this->storeFile($data['thumbnailFile']);
            unset($data['thumbnailFile']);
        }

        $data['updated_by'] = auth()->id();
        $post->update($data);

        // Update categories only if key exists in request
        if (array_key_exists('category_ids', $data)) {
            // If it's empty array, sync empty; otherwise sync IDs
            $post->categories()->sync($data['category_ids'] ?? []);
        }

        // Update tags only if key exists in request
        if (array_key_exists('tag_ids', $data)) {
            $post->tags()->sync($data['tag_ids'] ?? []);
        }

        return $post->load(['categories', 'tags']);
    }

    /**
     * Delete a post and its thumbnail.
     *
     * @param Post $post
     * @return void
     */
    public function delete(Post $post): void
    {
        if ($post->thumbnail) {
            $this->deleteFile($post->thumbnail);
        }

        $post->deleted_by = auth()->id();
        $post->save();
        $post->delete();
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
     * Bulk update posts.
     *
     * @param array $validated
     * @return array
     */
    public function bulkUpdate(array $validated): array
    {
        $posts = Post::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $posts = $posts->get();
                foreach ($posts as $post) {
                    $this->delete($post);
                }
                return ['message' => 'Posts deleted.'];

            case 'status':
                $data = $validated['data'];
                $status = PostStatus::tryFrom($data['status']);
                $scheduled_at = null;

                if ($status == PostStatus::SCHEDULED) {
                    $scheduled_at = $data['scheduled_at'] ?? now()->addHours(4);
                    $posts->update([
                        'status' => PostStatus::SCHEDULED,
                        'scheduled_at' => $scheduled_at,
                    ]);
                } elseif ($status == PostStatus::PUBLISHED) {
                    $published_at = $data['published_at'] ?? now();
                    $posts->update([
                        'status' => PostStatus::PUBLISHED,
                        'published_at' => $published_at,
                    ]);
                } elseif ($status == PostStatus::ARCHIVED) {
                    $posts->where('status', PostStatus::PUBLISHED)
                        ->update(['status' => PostStatus::ARCHIVED]);
                } else {
                    $posts->update([
                        'status' => PostStatus::DRAFT,
                        'scheduled_at' => $scheduled_at,
                    ]);
                }
                return ['message' => 'Status updated.'];

            case 'page_category_id':
                $posts->update(['page_category_id' => $validated['data']['page_category_id']]);
                return ['message' => 'Category updated.'];

            case 'visibility':
                $posts->update(['visibility' => $validated['data']['visibility']]);
                return ['message' => 'Visibility updated.'];

            case 'post_type':
                $posts->update(['post_type' => $validated['data']['post_type']]);
                return ['message' => 'Post Type updated.'];

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
