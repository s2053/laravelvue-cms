<?php

namespace App\Http\Controllers\Api;

use App\Enums\Widgets\ContentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\WidgetRequest;
use App\Http\Resources\WidgetItemResource;
use App\Http\Resources\WidgetResource;
use App\Http\Resources\WidgetWithItemResource;
use App\Models\Widget;
use App\Services\WidgetService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class WidgetController extends Controller
{
    protected WidgetService $service;

    public function __construct(WidgetService $service)
    {
        $this->service = $service;
    }

    /**
     * List widgets with optional pagination or full list.
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $perPage = (int) $request->input('rows', 25);
        $all = $request->boolean('all', false);

        $widgets = $this->service->list($params, $perPage, $all);

        return WidgetResource::collection($widgets);
    }

    /**
     * Store a new widget.
     */
    public function store(WidgetRequest $request)
    {
        $widget = $this->service->create($request->validated());

        return (new WidgetResource($widget))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a specific widget.
     */
    public function show(Widget $widget)
    {
        $widget = $this->service->show($widget);

        return new WidgetWithItemResource($widget);
    }

    /**
     * Update an existing widget.
     */
    public function update(WidgetRequest $request, Widget $widget)
    {
        $widget = $this->service->update($widget, $request->validated());

        return new WidgetResource($widget);
    }

    /**
     * Delete a widget.
     */
    public function destroy(Widget $widget)
    {
        $this->service->delete($widget);

        return response()->json(null, 204);
    }

    /**
     * Bulk update or delete widgets.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:delete,status',
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:widgets,id',
            'data' => 'nullable|array',
        ]);

        $result = $this->service->bulkUpdate($validated);

        return response()->json($result);
    }

    public function updateWidgetItems(Request $request, Widget $widget)
    {
        $validated = $request->validate([
            'items' => 'array',
            'items.*.id' => 'nullable|integer',
            'items.*.title' => 'required|string|max:255',
            'items.*.url' => 'nullable|string|max:255',
            'items.*.icon' => 'nullable|string|max:255',
            'items.*.parent_id' => 'integer',
            'items.*.content_type' => ['required', new Enum(ContentType::class)],
            'items.*.content_type_id' => 'required|integer',
            'items.*.target' => 'required|string',
            'items.*.status' => 'boolean',
            'items.*.children' => 'array',
        ]);

        $widget = $this->service->updateMenuItems($widget, $validated['items']);


        return new WidgetWithItemResource($widget);


    }
}
