<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    protected RoleService $service;

    public function __construct(RoleService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of roles, optionally paginated or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return RoleResource::collection($records);
    }

    /**
     * Store a newly created role.
     */
    public function store(RoleRequest $request)
    {
        $record = $this->service->create($request->validated());

        return (new RoleResource($record))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        $record = $this->service->show($role);

        return new RoleResource($record);
    }

    /**
     * Update the specified role.
     */
    public function update(RoleRequest $request, $id)
    {
        $role = Role::where('id', $id)
            ->where('guard_name', 'web')
            ->firstOrFail();

        $record = $this->service->update($role, $request->validated());

        return new RoleResource($record);
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        $this->service->delete($role);

        return response()->json(null, 204);
    }

    /**
     * Bulk update or delete roles.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:roles,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
