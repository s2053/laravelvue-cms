<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    //

    public function roles()
    {
        return Role::with('permissions')->get();
    }


    public function permissions()
    {
        return Permission::all();
    }

    public function createRole(Request $request)
    {
        $request->validate(['name' => 'required|unique:roles']);
        return Role::create(['name' => $request->name]);
    }

    public function createPermission(Request $request)
    {
        $request->validate(['name' => 'required|unique:permissions']);
        return Permission::create(['name' => $request->name]);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate(['name' => 'required|unique:roles,name,' . $id]);
        $role = Role::findOrFail($id);
        $role->name = $request->name;
        $role->save();
        return $role;
    }

    public function deleteRole($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }

    public function getRoleById($id)
{
    return Role::with('permissions')->findOrFail($id);
}
}
