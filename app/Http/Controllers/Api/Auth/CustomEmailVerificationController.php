<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Redirect;

class CustomEmailVerificationController extends Controller
{
    public function __invoke(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Check if the URL is a valid signed URL
        if (!URL::hasValidSignature($request)) {
            abort(403, 'Invalid or expired verification link.');
        }

        // Check if the hash matches the user's email hash (like Laravel does internally)
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link.');
        }

        if ($user->hasVerifiedEmail()) {
            // If already verified, just redirect
            return Redirect::to(config('app.frontend_url') . '/login?verified=1');
        }

        // Mark email as verified
        $user->markEmailAsVerified();

        // Fire Verified event (optional)
        event(new Verified($user));

        // Redirect to frontend login page with success message
        return Redirect::to(config('app.frontend_url') . '/login?verified=1');
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], status: 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent!']);
    }
}
