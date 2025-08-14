<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles with permissions.
     */
    public function index()
    {
        return response()->json(Role::with('permissions')->get());
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:roles',
            'permissions' => 'array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);
        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web'
        ]);
        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }
        // Return with permissions
        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Display the specified role with permissions.
     */
    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|unique:roles,name,' . $id,
            'permissions' => 'array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);
        // dd($id);
        $role = Role::where('id', $id)
            ->where('guard_name', 'web')
            ->firstOrFail();
        $role->name = $validated['name'];
        $role->save();
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }
        // Return with permissions
        return response()->json($role->load('permissions'));
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }
}
