<?php

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

class RoleService
{
    /**
     * List roles with optional pagination and search.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return LengthAwarePaginator|Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = Role::with('permissions')->withCount('permissions');

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('roles.name', 'like', "%$search%")
                    ->orWhereHas('permissions', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%$search%");
                    });
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

            if ($params['sort_by'] === 'permissions_count') {
                $query->orderBy('permissions_count', $sortDir);
            } else {
                $query->orderBy($params['sort_by'], $sortDir);
            }
        }

        return $all ? $query->get() : $query->paginate($perPage);
    }

    /**
     * Create a new role with optional permissions.
     */
    public function create(array $data): Role
    {
        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web'
        ]);

        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions');
    }

    /**
     * Get a specific role.
     */
    public function show(Role $record): Role
    {
        return $record->load('permissions');
    }

    /**
     * Update an existing role.
     */
    public function update(Role $record, array $data): Role
    {
        $record->update([
            'name' => $data['name']
        ]);

        if (isset($data['permissions'])) {
            $record->syncPermissions($data['permissions']);
        }

        return $record->load('permissions');
    }

    /**
     * Delete a role.
     */
    public function delete(Role $record): void
    {
        $record->delete();
    }

    /**
     * Get roles for dropdown or search.
     *
     * @param string|null $search
     * @param bool $all
     * @return \Illuminate\Support\Collection
     */
    public function getOptions(?string $search = null, bool $all = false)
    {
        $query = Role::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $records = $all ? $query->get() : $query->limit(20)->get();

        return $records->map(fn($r) => [
            'id' => $r->id,
            'name' => $r->name,
        ]);
    }

    /**
     * Bulk update or delete.
     */
    public function bulkUpdate(array $validated): array
    {
        switch ($validated['action']) {
            case 'delete':
                Role::whereIn('id', $validated['ids'])->delete();
                return ['message' => 'Roles deleted.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }
}
