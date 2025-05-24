<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return User::with('roles')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role_ids' => 'array',
            'role_ids.*' => 'exists:roles,id',
        ]);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        if (!empty($data['role_ids'])) {
            $user->syncRoles($data['role_ids']);
        }
        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user->load('roles'),
        ], 201);
    }

    public function show($id)
    {
        return User::with('roles')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|confirmed',
            'role_ids' => 'array',
            'role_ids.*' => 'exists:roles,id',
        ]);
        $user->name = $data['name'];
        $user->email = $data['email'];
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();
        if (isset($data['role_ids'])) {
            $user->syncRoles($data['role_ids']);
        }
        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->load('roles'),
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully.',
        ], 200);
    }

    public function assignRoles(Request $request, User $user)
    {
        $data = $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);
        $user->syncRoles($data['role_ids']);
        return response()->json([
            'message' => 'Roles assigned successfully.',
            'user' => $user->load('roles'),
        ], 200);
    }
}
