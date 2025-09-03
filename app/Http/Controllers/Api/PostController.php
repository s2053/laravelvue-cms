<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
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

        $posts = $this->service->list($params, $perPage, $all);

        return PostResource::collection($posts);
    }

    // Store a new post
    public function store(PostRequest $request)
    {
        $data = $request->validated();

        $post = $this->service->create($data);

        return (new PostResource($post))
            ->response()
            ->setStatusCode(201);

    }

    // Show a specific post
    public function show(Post $post)
    {
        $post = $this->service->show($post);
        return new PostResource($post);
    }

    // Update a post
    public function update(PostRequest $request, Post $post)
    {
        $data = $request->validated();




        $updatedPost = $this->service->update($post, $data);

        return new PostResource($updatedPost);
    }

    // Delete a post
    public function destroy(Post $post)
    {
        $this->service->delete($post);

        return response()->json(null, 204);
    }

    // Bulk update posts
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status,category_ids,visibility,post_type',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:posts,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }
}
