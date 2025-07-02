<?php

namespace App\Http\Controllers;

use App\Enums\PageStatus;
use App\Enums\PageType;
use App\Enums\PageVisibility;
use App\Filters\PageFilter;
use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
class PageController extends Controller
{
    // List all pages
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);

        $query = Page::with('category');

        $filter = new PageFilter($params);

        $filteredQuery = $filter->apply($query);

        if ($request->boolean('all')) {
            // Return all results (no pagination)
            $pages = $filteredQuery->get();
            return PageResource::collection($pages);
        } else {
            // Return paginated results
            $pages = $filteredQuery->paginate($perPage);
            return PageResource::collection($pages);
        }
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


    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status,page_category_id,visibility,page_type',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pages,id',
            'data' => 'nullable|array',
        ]);

        $pages = Page::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $pages->delete();
                return response()->json(['message' => 'Pages deleted.']);

            case 'status':

                $scheduled_at = null;
                $data = $validated['data'];
                $status = PageStatus::tryFrom($data['status']);

                //  dd($data['status'], PageStatus::SCHEDULED);
                if ($status == PageStatus::SCHEDULED) {
                    $scheduled_at = $data['scheduled_at'] ?? null;

                    if ($scheduled_at == null) {
                        $scheduled_at = Carbon::now()->addHours(4);

                    }

                    $pages->update([
                        'status' => PageStatus::SCHEDULED,
                        'scheduled_at' => $scheduled_at,
                    ]);
                } else if ($status == PageStatus::PUBLISHED) {

                    $published_at = $data['published_at'] ?? null;

                    if ($published_at == null) {
                        $published_at = Carbon::now();

                    }

                    $pages->update([
                        'status' => PageStatus::PUBLISHED,
                        'published_at' => $published_at,
                    ]);
                } else if ($status == PageStatus::ARCHIVED) {
                    $pages->where('status', PageStatus::PUBLISHED)
                        ->update([
                            'status' => PageStatus::ARCHIVED,
                        ]);
                } else {
                    $pages->update([
                        'status' => PageStatus::DRAFT,
                        'scheduled_at' => $scheduled_at,
                    ]);
                }

                return response()->json(['message' => 'Status updated.']);

            case 'page_category_id':
                $pages->update(['page_category_id' => $validated['data']['page_category_id']]);
                return response()->json(['message' => 'Category updated.']);

            case 'visibility':
                $pages->update(['visibility' => $validated['data']['visibility']]);
                return response()->json(['message' => 'Visibility updated.']);

            case 'page_type':
                $pages->update(['page_type' => $validated['data']['page_type']]);
                return response()->json(['message' => 'Page Type updated.']);

            default:
                return response()->json(['message' => 'Invalid action'], 400);
        }

    }

}
