<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionGroupRequest;
use App\Http\Resources\PermissionGroupResource;
use App\Models\PermissionGroup;
use App\Services\PermissionGroupService;
use Illuminate\Http\Request;

class PermissionGroupController extends Controller
{

    protected PermissionGroupService $service;


    public function __construct(PermissionGroupService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the permission groups.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return PermissionGroupResource::collection($records);
    }

    /**
     * Store a newly created permission group in storage.
     */
    public function store(PermissionGroupRequest $request)
    {
        $record = $this->service->create($request->validated());

        return (new PermissionGroupResource($record))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified permission group.
     */
    public function show(PermissionGroup $permission_group)
    {
        $record = $this->service->show($permission_group);

        return new PermissionGroupResource($record);
    }

    /**
     * Update the specified permission group in storage.
     */
    public function update(PermissionGroupRequest $request, PermissionGroup $permission_group)
    {
        $record = $this->service->update($permission_group, $request->validated());

        return new PermissionGroupResource($record);
    }

    /**
     * Remove the specified permission group.
     */
    public function destroy(PermissionGroup $permission_group)
    {
        $this->service->delete($permission_group);

        return response()->json(null, 204);
    }

    /**
     * Remove the specified permission group from storage.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:permission_groups,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
