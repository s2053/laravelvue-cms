<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the permissions.
     */
    public function index()
    {
        return response()->json(
            Permission::with('group')->get()
        );
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'unique:permissions,name,',
                'regex:/^[A-Za-z0-9_.]+$/'
            ],
            'permission_group_id' => ['nullable', 'exists:permission_groups,id'],
        ], [
            'name.regex' => 'The permission name may only contain letters, numbers, underscores, and dots.',
        ]);
        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
            'permission_group_id' => $validated['permission_group_id'] ?? null,
        ]);
        return response()->json($permission, 201);
    }


    /**
     * Display the specified permission.
     */
    public function show($id)
    {
        $permission = Permission::findOrFail($id);
        return response()->json($permission);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'unique:permissions,name,' . $id,
                'regex:/^[A-Za-z0-9_.]+$/'
            ],
            'permission_group_id' => ['nullable', 'exists:permission_groups,id'],
        ], [
            'name.regex' => 'The permission name may only contain letters, numbers, underscores, and dots.',
        ]);
        $permission = Permission::where('id', $id)
            ->where('guard_name', 'web')
            ->firstOrFail();
        $permission->name = $validated['name'];
        $permission->permission_group_id = $validated['permission_group_id'] ?? null;
        $permission->save();
        return response()->json($permission);
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy($id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();
        return response()->json(['message' => 'Permission deleted successfully']);
    }
}
