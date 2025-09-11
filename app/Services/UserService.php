<?php

namespace App\Services;

use App\Filters\UserFilter;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    /**
     * List users with optional filters, roles, and pagination.
     */
    public function list(array $params = [], int $perPage = 25, bool $all = false): LengthAwarePaginator|Collection
    {
        $query = User::with('roles');
        $filter = new UserFilter($params);
        $query = $filter->apply($query);

        return $all ? $query->get() : $query->paginate($perPage);
    }

    /**
     * Create a new user and assign roles.
     */
    public function create(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'created_by' => auth()->id(), // Track creator
            'updated_by' => auth()->id(), // initial updated_by same as creator
        ]);
        if (!empty($data['role_ids'])) {
            $user->syncRoles($data['role_ids']);
        }

        return $user->load('roles');
    }

    /**
     * Get a specific user with roles.
     */
    public function show(User $user): User
    {
        return $user->load('roles');
    }

    /**
     * Update a user including optional password and roles.
     */
    public function update(User $user, array $data): User
    {
        $user->name = $data['name'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->updated_by = auth()->id();
        $user->save();

        if (isset($data['role_ids'])) {
            $user->syncRoles($data['role_ids']);
        }

        return $user->load('roles');
    }

    /**
     * Update only user details (name + email).
     */
    public function updateDetails(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        return $user->load('roles');
    }

    /**
     * Update only user password.
     */
    public function updatePassword(User $user, string $password): User
    {
        $user->password = Hash::make($password);
        $user->save();

        return $user->load('roles');
    }

    /**
     * Update only user roles.
     */
    public function updateRoles(User $user, array $roleIds): User
    {
        $user->syncRoles($roleIds);
        return $user->load('roles');
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): void
    {
        $user->deleted_by = auth()->id();
        $user->save();
        $user->delete();
    }

    /**
     * Bulk update users.
     */

    public function bulkUpdate(array $validated): array
    {
        $recs = User::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $recs = $recs->get();
                foreach ($recs as $rec) {
                    $rec->deleted_by = auth()->id();
                    $rec->save();
                    $this->delete($rec);
                }
                return ['message' => 'Records deleted.'];

            case 'status':
                $data = $validated['data'];
                $recs->update([
                    'status' => $data['status'],
                    'updated_by' => auth()->id(),
                ]);
                return ['message' => 'Status updated.'];


            case 'email_verified_at':
                $data = $validated['data'];
                $recs->update([
                    'email_verified_at' => $data['email_verification_status'] ? now() : null,
                    'updated_by' => auth()->id(),
                ]);
                return ['message' => 'Email verification status updated.'];



            default:
                return ['message' => 'Invalid action'];
        }
    }

}
