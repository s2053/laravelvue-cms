<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostTagRequest;
use App\Http\Resources\PostTagResource;
use App\Models\PostTag;
use App\Services\PostTagService;
use Illuminate\Http\Request;

class PostTagController extends Controller
{
    protected PostTagService $service;

    public function __construct(PostTagService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of post tags, with optional pagination or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $records = $this->service->list($params, $perPage, $all);

        return PostTagResource::collection($records);
    }

    /**
     * Store a newly created post tag.
     */
    public function store(PostTagRequest $request)
    {
        $record = $this->service->create($request->validated());

        return (new PostTagResource($record))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified post tag.
     */
    public function show(PostTag $post_tag)
    {
        $record = $this->service->show($post_tag);

        return new PostTagResource($record);
    }

    /**
     * Update the specified post tag.
     */
    public function update(PostTagRequest $request, PostTag $post_tag)
    {
        $record = $this->service->update($post_tag, $request->validated());

        return new PostTagResource($record);
    }

    /**
     * Remove the specified post tag.
     */
    public function destroy(PostTag $post_tag)
    {
        $this->service->delete($post_tag);

        return response()->json(null, 204);
    }

    /**
     * Bulk update or delete post tags.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:post_tags,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
