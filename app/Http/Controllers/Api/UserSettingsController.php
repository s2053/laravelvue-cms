<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Http\Requests\User\UserEditDetailsRequest;
use App\Http\Requests\User\UserEditPasswordRequest;
use App\Http\Resources\UserResource;
use App\Services\UserSettingsService;
use Illuminate\Http\Request;

class UserSettingsController extends Controller
{
    protected UserSettingsService $service;

    public function __construct(UserSettingsService $service)
    {
        $this->service = $service;
    }

    /**
     * Update authenticated user's profile
     */
    public function updateProfile(UserEditDetailsRequest $request)
    {
        $user = $request->user();

        $record = $this->service->updateProfile($user, $request->validated());

        return new UserResource($record);
    }

    /**
     * Update authenticated user's security settings
     */
    public function updateSecurity(UserEditPasswordRequest $request)
    {
        $user = $request->user();

        $this->service->updateSecurity($user, $request->validated());

        return response()->json([
            'data' => null,
            'message' => 'Security settings updated successfully.'
        ], 200);
    }

    /**
     * Update authenticated user's preferences (JSON data).
     */
    public function updatePreferences(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'appearance' => 'string',
        ]);

        $record = $this->service->updatePreferences($user, $validated);

        return new UserResource(resource: $record);
    }


}
