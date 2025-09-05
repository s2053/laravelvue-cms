<?php

namespace App\Services;

use App\Models\PermissionGroup;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PermissionGroupService
{
    /**
     * List permission groups with optional pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return LengthAwarePaginator|Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = PermissionGroup::query()->with('permissions')->withCount('permissions');

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('created_at', 'like', "%{$search}%");

            });
        }

        if (!empty($params['created_at'])) {
            $query->whereDate('created_at', $params['created_at']);
        }

        // Sorting
        if (!empty($params['sort_by'])) {
            $sortDir = strtolower($params['sort_dir'] ?? 'asc');
            if (!in_array($sortDir, ['asc', 'desc'])) {
                $sortDir = 'asc';
            }

            if ($params['sort_by'] === 'permissions') {
                $query->orderBy('permissions_count', $sortDir);
            } else {
                $query->orderBy($params['sort_by'], $sortDir);
            }
        }

        if ($all) {
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new permission group.
     */
    public function create(array $data): PermissionGroup
    {
        return PermissionGroup::create($data);
    }

    /**
     * Get a specific permission group.
     */
    public function show(PermissionGroup $record): PermissionGroup
    {
        return $record;
    }

    /**
     * Update an existing permission group.
     */
    public function update(PermissionGroup $record, array $data): PermissionGroup
    {
        $record->update($data);
        return $record;
    }

    /**
     * Delete a permission group.
     */
    public function delete(PermissionGroup $record): void
    {
        $record->delete();
    }



    /**
     * Get permission group for dropdown or search.
     *
     * @param string|null $search
     * @param bool $all
     * @return \Illuminate\Support\Collection
     */
    public function getOptions(?string $search = null, bool $all = false)
    {
        $query = PermissionGroup::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $all ? $query->get() : $query->limit(20)->get();

        return $categories->map(fn($c) => [
            'id' => $c->id,
            'title' => $c->title
        ]);
    }

    /**
     * Bulk update or delete.
     */
    public function bulkUpdate(array $validated): array
    {
        switch ($validated['action']) {
            case 'delete':
                PermissionGroup::whereIn('id', $validated['ids'])->delete();
                return ['message' => 'Permission groups deleted.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }
}
