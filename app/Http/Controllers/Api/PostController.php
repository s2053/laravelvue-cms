<?php

namespace App\Http\Controllers\Api;

use App\Enums\PageStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Services\Posts\PostService;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected PostService $service;

    public function __construct(PostService $service)
    {
        $this->service = $service;
    }

    // List all pages
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $pages = $this->service->list($params, $perPage, $all);

        return PageResource::collection($pages);
    }

    // Store a new page
    public function store(PageRequest $request)
    {
        $data = $request->validated();

        $page = $this->service->create($data);

        return (new PageResource($page))
            ->response()
            ->setStatusCode(201);

    }

    // Show a specific page
    public function show(Page $page)
    {
        $page = $this->service->show($page);
        return new PageResource($page);
    }

    // Update a page
    public function update(PageRequest $request, Page $page)
    {
        $data = $request->validated();




        $updatedPage = $this->service->update($page, $data);

        return new PageResource($updatedPage);
    }

    // Delete a page
    public function destroy(Page $page)
    {
        $this->service->delete($page);

        return response()->json(null, 204);
    }

    // Bulk update pages
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status,page_category_id,visibility,page_type',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pages,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
