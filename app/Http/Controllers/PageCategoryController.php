<?php

namespace App\Http\Controllers;

use App\Http\Requests\PageCategoryRequest;
use App\Http\Resources\PageCategoryResource;
use App\Models\PageCategory;
use App\Services\PageCategoryService;
use Illuminate\Http\Request;

class PageCategoryController extends Controller
{
    protected PageCategoryService $service;

    public function __construct(PageCategoryService $service)
    {
        $this->service = $service;
    }

    /**
     * List page categories with optional pagination or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $categories = $this->service->list($params, $perPage, $all);

        return PageCategoryResource::collection($categories);
    }

    /**
     * Store a new page category.
     */
    public function store(PageCategoryRequest $request)
    {
        $category = $this->service->create($request->validated());

        return (new PageCategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a specific page category.
     */
    public function show(PageCategory $pageCategory)
    {
        $pageCategory = $this->service->show($pageCategory);

        return new PageCategoryResource($pageCategory);
    }

    /**
     * Update an existing page category.
     */
    public function update(PageCategoryRequest $request, PageCategory $pageCategory)
    {
        $category = $this->service->update($pageCategory, $request->validated());

        return new PageCategoryResource($category);
    }

    /**
     * Delete a page category.
     */
    public function destroy(PageCategory $pageCategory)
    {
        $this->service->delete($pageCategory);

        return response()->json(null, 204);
    }

    /**
     * Bulk update or delete page categories.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:page_categories,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
