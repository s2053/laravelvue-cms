<?php

namespace App\Services\Posts;

use App\Models\PostCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostCategoryService
{
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
        $query = PostCategory::query();

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
     * Create a new post category.
     */
    public function create(array $data): PostCategory
    {
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
}
