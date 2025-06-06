<?php

namespace App\Http\Controllers;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class PageController extends Controller
{
    // List all pages
    public function index()
    {
        return Page::all();
    }

    // Store a new page
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                // Rule::unique('pages', 'slug'),
            ],
            'page_type' => ['required', new Enum(type: PageType::class)],
            'is_commentable' => 'boolean',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'featured_media_type' => 'nullable|string|max:255',
            'featured_media_url' => 'nullable|string|max:255',
            'media_source' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
            'scheduled_at' => 'nullable|date',
            'page_category_id' => 'nullable|exists:page_categories,id',

        ]);

        $page = new Page($validated);
        $page->created_by = auth()->id();
        $page->save();

        return response()->json($page, 201);
    }

    // Show a specific page
    public function show($id)
    {
        return Page::findOrFail($id);
    }

    // Update a page
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                // Rule::unique('pages', 'slug')->ignore($page->id),
            ],
            'page_type' => ['required', new Enum(type: PageType::class)],
            'is_commentable' => 'boolean',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'featured_media_type' => 'nullable|string|max:255',
            'featured_media_url' => 'nullable|string|max:255',
            'media_source' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
            'scheduled_at' => 'nullable|date',
            'page_category_id' => 'nullable|exists:page_categories,id',



        ]);

        $page->fill($validated);
        $page->updated_by = auth()->id();
        $page->save();
        return $page;
    }

    // Delete a page
    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->deleted_by = auth()->id();
        $page->save();
        $page->delete();

        return response()->json(null, 204);
    }
}
