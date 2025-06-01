<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PageCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PageCategoryController extends Controller
{
    // List all page categories
    public function index()
    {
        return PageCategory::all();
    }

    // Store a new page category
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'slug' => [
            'nullable',
            'string',
            'max:255',
            Rule::unique('page_categories', 'slug'),
        ],
        'description' => 'nullable|string',
        'meta_title' => 'nullable|string|max:255',
        'meta_description' => 'nullable|string|max:500',
        'meta_keywords' => 'nullable|string|max:255',
        'status' => 'boolean',
    ]);

    $category = PageCategory::create($validated);

    return response()->json($category, 201);
}

    // Show a specific page category
    public function show($id)
    {
        return PageCategory::findOrFail($id);
    }

    // Update a page category
public function update(Request $request, $id)
{
    $category = PageCategory::findOrFail($id);

    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'slug' => [
            'nullable',
            'string',
            'max:255',
            Rule::unique('page_categories', 'slug')->ignore($category->id),
        ],
        'description' => 'nullable|string',
        'meta_title' => 'nullable|string|max:255',
        'meta_description' => 'nullable|string|max:500',
        'meta_keywords' => 'nullable|string|max:255',
        'status' => 'boolean',
    ]);

    $category->update($validated);

    return $category;
}

    // Delete a page category
    public function destroy($id)
    {
        $category = PageCategory::findOrFail($id);
        $category->delete();

        return response()->json(null, 204);
    }
}
