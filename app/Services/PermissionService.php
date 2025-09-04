<?php

namespace App\Services;

use App\Models\Permission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PermissionService
{
    /**
     * List permissions with optional pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return LengthAwarePaginator|Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = Permission::with("group");

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

            if ($params['sort_by'] === 'permission_group') {
                $query->join('permission_groups', 'permissions.permission_group_id', '=', 'permission_groups.id')
                    ->orderBy('permission_groups.name', $sortDir)
                    ->select('permissions.*'); 
            } else {
                $query->orderBy($params['sort_by'], $sortDir);
            }
        }

        return $all ? $query->get() : $query->paginate($perPage);
    }

    /**
     * Create a new permission.
     */
    public function create(array $data): Permission
    {
        return Permission::create([
            'name' => $data['name'],
            'guard_name' => 'web',
            'permission_group_id' => $data['permission_group_id'] ?? null,
        ]);
    }

    /**
     * Get a specific permission.
     */
    public function show(Permission $record): Permission
    {
        return $record->load(['group']);
    }

    /**
     * Update an existing permission.
     */
    public function update(Permission $record, array $data): Permission
    {
        $record->update([
            'name' => $data['name'],
            'permission_group_id' => $data['permission_group_id'] ?? null,
        ]);

        return $record->load(['group']);
    }

    /**
     * Delete a permission.
     */
    public function delete(Permission $record): void
    {
        $record->delete();
    }

    /**
     * Get permissions for dropdown or search.
     *
     * @param string|null $search
     * @param bool $all
     * @return \Illuminate\Support\Collection
     */
    public function getOptions(?string $search = null, bool $all = false)
    {
        $query = Permission::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $records = $all ? $query->get() : $query->limit(20)->get();

        return $records->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
        ]);
    }

    /**
     * Bulk update or delete.
     */
    public function bulkUpdate(array $validated): array
    {
        switch ($validated['action']) {
            case 'delete':
                Permission::whereIn('id', $validated['ids'])->delete();
                return ['message' => 'Permissions deleted.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }
}
