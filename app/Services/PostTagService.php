<?php

namespace App\Services;

use App\Models\PostTag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostTagService
{
    /**
     * List post tags with optional pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return LengthAwarePaginator|Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = PostTag::query();

        // Add filters if needed
        // $filter = new PostTagFilter($params);
        // $query = $filter->apply($query);

        if ($all) {
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new post tag.
     */
    public function create(array $data): PostTag
    {
        return PostTag::create($data);
    }

    /**
     * Get a specific post tag.
     */
    public function show(PostTag $record): PostTag
    {
        return $record;
    }

    /**
     * Update an existing post tag.
     */
    public function update(PostTag $record, array $data): PostTag
    {
        $record->update($data);
        return $record;
    }

    /**
     * Delete a post tag.
     */
    public function delete(PostTag $record): void
    {
        $record->delete();
    }

    /**
     * Bulk update or delete.
     */
    public function bulkUpdate(array $validated): array
    {
        switch ($validated['action']) {
            case 'delete':
                PostTag::whereIn('id', $validated['ids'])->delete();
                return ['message' => 'Post tags deleted.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }
}
