<?php

namespace App\Services;

use App\Enums\Widgets\ContentType;
use App\Filters\CategoryFilter;
use App\Filters\WidgetFilter;
use App\Models\Widget;
use DB;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class WidgetService
{

    /**
     * List widgets with optional pagination.
     *
     * @param array $params
     * @param int $perPage
     * @param bool $all
     * @return LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {
        $query = Widget::query();

        $filter = new WidgetFilter($params);
        $query = $filter->apply($query);

        if ($all) {
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new widget.
     */
    public function create(array $data): Widget
    {
        return Widget::create($data);
    }

    /**
     * Get a specific widget.
     */
    public function show(Widget $widget): Widget
    {
        return $widget->load([
            'items' => function ($q) {
                $q->where('parent_id', 0)->orderBy('ordernum')->with('children');
            }
        ]);
    }

    /**
     * Update an existing widget.
     */
    public function update(Widget $widget, array $data): Widget
    {
        $widget->update($data);
        return $widget;
    }

    /**
     * Delete a widget.
     */
    public function delete(Widget $widget): void
    {
        // Optional safeguard: prevent deleting default widgets
        if ($widget->is_default) {
            throw new \Exception('Default widgets cannot be deleted.');
        }

        $widget->delete();
    }

    /**
     * Bulk update or delete widgets.
     *
     * @param array $validated
     * @return array
     */
    public function bulkUpdate(array $validated): array
    {
        $recs = Widget::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $widgets = $recs->get();
                foreach ($widgets as $widget) {
                    $this->delete($widget);
                }
                return ['message' => 'Widgets deleted.'];

            case 'status':
                $data = $validated['data'];
                $recs->update([
                    'status' => $data['status']
                ]);
                return ['message' => 'Status updated.'];

            default:
                return ['message' => 'Invalid action'];
        }
    }


    public function updateMenuItems(Widget $widget, array $items)
    {
        DB::transaction(function () use ($widget, $items) {
            $widget->items()->delete();
            $this->saveWidgetItems($widget, $items);
        });
        return $widget->load([
            'items' => function ($q) {
                $q->where('parent_id', 0)->orderBy('ordernum')->with('children');
            }
        ]);
    }

    private function saveWidgetItems(Widget $widget, array $items, $parentId = 0)
    {
        foreach ($items as $index => $itemData) {
            $widgetItem = $widget->items()->create([
                'title' => $itemData['title'],
                'url' => $itemData['url'] ?? null,
                'icon' => $itemData['icon'] ?? null,
                'target' => $itemData['target'] ?? '_self',
                'ordernum' => $index,
                'parent_id' => $parentId,
                'content_type' => $itemData['content_type'] ?? 'custom',
                'content_type_id' => $itemData['content_type_id'] ?? 0,
                'status' => $itemData['status'] ?? true,
            ]);

            if (!empty($itemData['children'])) {
                $this->saveWidgetItems($widget, $itemData['children'], $widgetItem->id);
            }
        }
    }

}
