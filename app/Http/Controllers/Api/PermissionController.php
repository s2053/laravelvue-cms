<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Services\PermissionService;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    protected PermissionService $service;

    public function __construct(PermissionService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of permissions, with optional pagination or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return PermissionResource::collection($records);
    }

    /**
     * Store a newly created permission.
     */
    public function store(PermissionRequest $request)
    {
        $record = $this->service->create($request->validated());

        return (new PermissionResource($record))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission)
    {
        $record = $this->service->show($permission);

        return new PermissionResource($record);
    }

    /**
     * Update the specified permission.
     */
    public function update(PermissionRequest $request, $id)
    {
        $permission = Permission::where('id', $id)
            ->where('guard_name', 'web')
            ->firstOrFail();

        $record = $this->service->update($permission, $request->validated());

        return new PermissionResource($record);
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Permission $permission)
    {
        $this->service->delete($permission);

        return response()->json(null, 204);
    }

    /**
     * Bulk update or delete permissions.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:permissions,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
