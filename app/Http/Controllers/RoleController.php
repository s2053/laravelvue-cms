<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
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
     * Display a listing of the permissions.
     */
    public function permissions()
    {
        return response()->json(Permission::all());
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:roles',
        ]);
        $role = Role::create(['name' => $validated['name']]);
        return response()->json($role, 201);
    }

    /**
     * Store a newly created permission in storage.
     */
    public function storePermission(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:permissions',
        ]);
        $permission = Permission::create(['name' => $validated['name']]);
        return response()->json($permission, 201);
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
        ]);
        $role = Role::findOrFail($id);
        $role->name = $validated['name'];
        $role->save();
        return response()->json($role);
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
