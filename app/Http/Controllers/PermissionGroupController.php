<?php

namespace App\Http\Controllers;

use App\Models\PermissionGroup;
use Illuminate\Http\Request;

class PermissionGroupController extends Controller
{
    /**
     * Display a listing of the permission groups.
     */
    public function index()
    {
        return response()->json(PermissionGroup::with('permissions')->get());
    }

    /**
     * Store a newly created permission group in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:permission_groups,name',
        ]);
        $group = PermissionGroup::create($validated);
        return response()->json($group, 201);
    }

    /**
     * Display the specified permission group.
     */
    public function show($id)
    {
        $group = PermissionGroup::with('permissions')->findOrFail($id);
        return response()->json($group);
    }

    /**
     * Update the specified permission group in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|unique:permission_groups,name,' . $id,
        ]);
        $group = PermissionGroup::findOrFail($id);
        $group->update($validated);
        return response()->json($group);
    }

    /**
     * Remove the specified permission group from storage.
     */
    public function destroy($id)
    {
        $group = PermissionGroup::findOrFail($id);
        $group->delete();
        return response()->json(['message' => 'Permission group deleted successfully']);
    }
}
