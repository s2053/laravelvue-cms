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

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                    ->orWhere('created_at', 'like', "%{$search}%");

            });
        }

        if (!empty($params['created_at'])) {
            $query->whereDate('created_at', $params['created_at']);
        }


        if (!empty($params['sort_by'])) {
            $sortDir = strtolower($params['sort_dir'] ?? 'asc');
            if (!in_array($sortDir, ['asc', 'desc'])) {
                $sortDir = 'asc';
            }

            $query->orderBy($params['sort_by'], $sortDir);
        }

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
