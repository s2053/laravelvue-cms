<?php
namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Notifications\ResetPassword;


class PasswordResetController extends Controller
{
    public function forgot(Request $request)
    {
        $request->validate(['email' => 'required|email']);


        ResetPassword::createUrlUsing(function ($notifiable, string $token) use ($request) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $email = urlencode($request->input('email'));

            return "$frontendUrl/reset-password?token=$token&email=$email";
        });

        $status = Password::sendResetLink($request->only('email'));


        // if ($status !== Password::RESET_LINK_SENT) {
        //     throw ValidationException::withMessages(['email' => __($status)]);
        // }

        return response()->json([
            'message' => 'If the email is registered, a password reset link has been sent.',
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password)
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return response()->json(['message' => 'Password reset successful.']);
    }
}
