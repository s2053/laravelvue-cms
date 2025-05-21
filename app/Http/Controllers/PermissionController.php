<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the permissions.
     */
    public function index()
    {
        return response()->json(Permission::all());
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
                'regex:/^[A-Za-z0-9_]+$/'
            ]
        ], [
            'name.regex' => 'The permission name may only contain letters, numbers, and underscores.',
        ]);
        $permission = Permission::create(['name' => $validated['name']]);
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
                'regex:/^[A-Za-z0-9_]+$/'
            ]
        ], [
            'name.regex' => 'The permission name may only contain letters, numbers, and underscores.',
        ]);
        $permission = Permission::findOrFail($id);
        $permission->name = $validated['name'];
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
