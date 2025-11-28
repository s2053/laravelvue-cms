<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserSettingsService
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Update user profile
     */
    public function updateProfile(User $user, array $data): User
    {
        return $this->userService->updateDetails($user, $data);
    }

    /**
     * Update security settings
     */
    public function updateSecurity(User $user, array $data): void
    {
        // Check current password
        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        if (!empty($data['password'])) {
            $this->userService->updatePassword($user, $data['password']);
        }

    }

    /**
     * Update user preferences
     */
    public function updatePreferences(User $user, array $data): User
    {
        $user->preferences = array_merge($user->preferences ?? [], $data);
        $user->save();

        return $user->fresh();
    }

}
