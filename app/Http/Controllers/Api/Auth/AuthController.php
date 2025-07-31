<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    //  Login (session-based, for Sanctum)
    public function login(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();


        return new UserResource(Auth::user());


    }

    // Get current user
    public function me(Request $request)
    {
        return (new UserResource(Auth::user()))->additional([
            'message' => 'Succesfull',
        ]);
    }

    //  Logout
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }
}
