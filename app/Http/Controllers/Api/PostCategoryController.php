<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostCategoryRequest;
use App\Http\Resources\PostCategoryResource;
use App\Models\PostCategory;
use App\Services\Posts\PostCategoryService;
use Illuminate\Http\Request;

class PostCategoryController extends Controller
{
    protected PostCategoryService $service;

    public function __construct(PostCategoryService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of post categories, with optional pagination or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return PostCategoryResource::collection($records);
    }

    /**
     * Store a newly created post category.
     */
    public function store(PostCategoryRequest $request)
    {
        $record = $this->service->create($request->validated());

        return (new PostCategoryResource($record))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified post category.
     */
    public function show(PostCategory $post_category)
    {
        $record = $this->service->show($post_category);

        return new PostCategoryResource($record);
    }

    /**
     * Update the specified post category.
     */
    public function update(PostCategoryRequest $request, PostCategory $post_category)
    {
        $record = $this->service->update($post_category, $request->validated());

        return new PostCategoryResource($record);
    }

    /**
     * Remove the specified post category.
     */
    public function destroy(PostCategory $post_category)
    {
        $this->service->delete($post_category);

        return response()->json(null, 204);
    }

    /**
     * Bulk update or delete post categories.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:post_categories,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
