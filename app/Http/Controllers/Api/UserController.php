<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UserDetailsRequest;
use App\Http\Requests\User\UserPasswordRequest;
use App\Http\Requests\User\UserRequest;
use App\Http\Requests\User\UserRolesRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of users, optionally paginated or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return UserResource::collection($records);
    }

    /**
     * Store a newly created user.
     */
    public function store(UserRequest $request)
    {
        $record = $this->service->create($request->validated());

        return (new UserResource($record))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $record = $this->service->show($user);

        return new UserResource($record);
    }

    /**
     * Update the specified user.
     */
    public function update(UserRequest $request, User $user)
    {
        $record = $this->service->update($user, $request->validated());

        return new UserResource($record);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $this->service->delete($user);

        return response()->json(null, 204);
    }

    /**
     * Update basic details (name, email, etc).
     */
    public function updateDetails(UserDetailsRequest $request, User $user)
    {
        $record = $this->service->updateDetails($user, $request->validated());

        return new UserResource($record);
    }

    /**
     * Update the user password.
     */
    public function updatePassword(UserPasswordRequest $request, User $user)
    {
        $record = $this->service->updatePassword($user, $request->validated()['password']);

        return new UserResource($record);
    }

    /**
     * Update the user roles.
     */
    public function updateRoles(UserRolesRequest $request, User $user)
    {
        $record = $this->service->updateRoles($user, $request->validated()['role_ids']);

        return new UserResource($record);
    }

    /**
     * Bulk update or delete users.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status,email_verified_at',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id',
            'data' => 'nullable|array',
            'data.status' => 'required_if:action,status|boolean',
            'data.email_verification_status' => 'required_if:action,email_verified_at|boolean',
        ], [], [
            'data.status' => 'status',
            'data.email_verification_status' => 'email_verification_status',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
