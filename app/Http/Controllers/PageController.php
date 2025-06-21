<?php

namespace App\Http\Controllers;

use App\Enums\PageStatus;
use App\Enums\PageType;
use App\Enums\PageVisibility;
use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class PageController extends Controller
{
    // List all pages
    public function index(Request $request)
    {
        $perPage = (int) $request->get('rows', 6);

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');

        $search = $request->get('search', null);

        $query = Page::query();

        $query->with('category');

        if ($sortBy === 'category') {
            $query->join('page_categories', 'pages.page_category_id', '=', 'page_categories.id')
                ->orderBy('page_categories.title', $sortDir)
                ->select('pages.*');
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('created_at', 'like', "%{$search}%");
            });
        }


        $pages = $query->paginate($perPage);

        return PageResource::collection($pages);
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
            'thumbnailFile' => 'nullable|image|max:2048',
            'featured_media_type' => 'nullable|string|max:255',
            'featured_media_url' => 'nullable|string|max:255',
            'media_source' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => ['required', new Enum(type: PageStatus::class)],
            'visibility' => ['required', new Enum(type: PageVisibility::class)],
            'scheduled_at' => 'nullable|date',
            'published_at' => 'nullable|date',
            'page_category_id' => 'nullable|exists:page_categories,id',

        ]);

        $page = new Page($validated);

        // Handle file upload
        if ($request->hasFile('thumbnailFile')) {

            $path = $request->file('thumbnailFile')->store('thumbnails', 'public');
            $page->thumbnail = $path;
        }
        $page->created_by = auth()->id();
        $page->save();

        return response()->json($page, 201);
    }

    // Show a specific page
    public function show(Page $page)
    {
        return new PageResource($page);
    }

    // Update a page
    public function update(Request $request, $id)
    {
        //  dd($request->all());
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
            'thumbnailFile' => 'nullable|image|max:2048',

            'body' => 'nullable|string',

            'featured_media_type' => 'nullable|string|max:255',
            'featured_media_url' => 'nullable|string|max:255',
            'media_source' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => ['required', new Enum(type: PageStatus::class)],
            'visibility' => ['required', new Enum(type: PageVisibility::class)],
            'scheduled_at' => 'nullable|date',
            'published_at' => 'nullable|date',
            'page_category_id' => 'nullable|exists:page_categories,id',
        ]);

        $page->fill($validated);

        if ($request->input("thumbnail") == null || $request->input("thumbnail") == '') {
            $page->thumbnail = null;
        }

        // Handle file upload
        if ($request->hasFile('thumbnailFile')) {
            // Optionally: delete old file
            if ($page->thumbnail) {
                \Storage::disk('public')->delete($page->thumbnail);
            }
            $path = $request->file('thumbnailFile')->store('thumbnails', 'public');
            $page->thumbnail = $path;
        }




        $page->updated_by = auth()->id();
        $page->save();
        return $page;
    }

    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->deleted_by = auth()->id();
        $page->save();
        $page->delete();

        return response()->json(null, 204);
    }
}
