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

    public function index(Request $request)
    {


        $params = $request->all();

        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $categories = $this->service->list($params,$perPage, $all);

        return PageCategoryResource::collection($categories);
    }

    public function store(PageCategoryRequest $request)
    {
        $category = $this->service->create($request->validated());

        return (new PageCategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    public function show(PageCategory $pageCategory)
    {
        return new PageCategoryResource($pageCategory);
    }

    public function update(PageCategoryRequest $request, PageCategory $pageCategory)
    {
        $category = $this->service->update($pageCategory, $request->validated());

        return new PageCategoryResource($category);
    }

    public function destroy(PageCategory $pageCategory)
    {
        $this->service->delete($pageCategory);

        return response()->json(null, 204);
    }
}
