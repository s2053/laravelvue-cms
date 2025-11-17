<?php

namespace App\Services;

use App\Enums\Widgets\ContentType;
use App\Filters\CategoryFilter;
use App\Filters\WidgetFilter;
use App\Models\Widget;
use App\Models\WidgetItem;
use DB;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Str;

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
                $q->where('parent_id', 0)->orderBy('ordernum')->withAllChildren();
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

            // Step 1: Gather all content IDs grouped by type
            $contentMap = $this->collectContentIds($items);

            // Step 2: Bulk fetch all required records
            $resolved = $this->loadContentSlugs($contentMap);

            // Step 3: Save all items using preloaded data
            $this->saveWidgetItems($widget, $items, 0, $resolved);

        });
        return $widget->load([
            'items' => function ($q) {
                $q->where('parent_id', 0)->orderBy('ordernum')->with('children');
            }
        ]);
    }
    private function saveWidgetItems(Widget $widget, array $items, $parentId = 0, array $resolved = [])
    {
        foreach ($items as $index => $itemData) {
            $contentType = $itemData['content_type'] ?? 'custom';
            $contentTypeId = $itemData['content_type_id'] ?? 0;

            $url = null;
            if ($contentType === 'custom') {
                $url = $itemData['url'] ? $this->sanitizeCustomUrl($itemData['url']) : null;
            } elseif (isset($resolved[$contentType][$contentTypeId])) {
                $slug = $resolved[$contentType][$contentTypeId]['slug'];
                $url = $this->getSlug($contentType, $slug);
            }

            $widgetItem = $widget->items()->create([
                'title' => $itemData['title'],
                'url' => $url,
                'icon' => $itemData['icon'] ?? null,
                'target' => $itemData['target'] ?? '_self',
                'ordernum' => $index,
                'parent_id' => $parentId,
                'content_type' => $contentType,
                'content_type_id' => $contentTypeId,
                'status' => $itemData['status'] ?? true,
            ]);

            if (!empty($itemData['children'])) {
                $this->saveWidgetItems($widget, $itemData['children'], $widgetItem->id, $resolved);
            }
        }
    }


    private function collectContentIds(array $items, array &$map = []): array
    {
        foreach ($items as $item) {
            if (!empty($item['content_type']) && !empty($item['content_type_id'])) {
                $map[$item['content_type']][] = $item['content_type_id'];
            }
            if (!empty($item['children'])) {
                $this->collectContentIds($item['children'], $map);
            }
        }
        return $map;
    }

    private function loadContentSlugs(array $map): array
    {
        $resolved = [];

        foreach ($map as $type => $ids) {
            $modelClass = match ($type) {
                'post' => \App\Models\Post::class,
                'page' => \App\Models\Page::class,
                'post_category' => \App\Models\PostCategory::class,
                'page_category' => \App\Models\PageCategory::class,
                'post_tag' => \App\Models\PostTag::class,
                default => null,
            };

            if ($modelClass) {
                $resolved[$type] = $modelClass::whereIn('id', $ids)
                    ->get(['id', 'slug'])
                    ->keyBy('id')
                    ->toArray();
            }
        }

        return $resolved;
    }


    private function getSlug(string $type, string $slug): string
    {
        return match ($type) {
            'post' => $slug,
            'page' => $slug,
            'page_category' => $slug,
            'post_category' => $slug,
            'post_tag' => $slug,
            default => '#',
        };
    }


    private function generateUrl(string $type, string $slug): string
    {
        return match ($type) {
            'post' => url("/posts/{$slug}"),
            'page' => url("/{$slug}"),
            'category' => url("/category/{$slug}"),
            default => '#',
        };
    }

    private function sanitizeCustomUrl(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        $url = trim($url);

        // External URLs: keep as-is if valid
        if (preg_match('#^https?://#i', $url)) {
            return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
        }

        // Split path and optional query/hash
        $parts = preg_split('/([?#])/', $url, 2, PREG_SPLIT_DELIM_CAPTURE);

        $path = Str::slug($parts[0], '-');

        // Reattach query/hash if present
        if (isset($parts[1], $parts[2])) {
            $path .= $parts[1] . $parts[2];
        }

        // If path is empty but there is a hash/query, don't add leading slash
        if (empty($parts[0]) && isset($parts[1], $parts[2])) {
            return $parts[1] . $parts[2]; // e.g., #section1
        }

        // Otherwise, add leading slash
        return '/' . ltrim($path, '/');
    }


    /**
     * Clean up widget items that reference deleted content.
     */
    public function deleteRelatedItems(ContentType $contentType, int $contentId): void
    {
        $items = WidgetItem::where('content_type', $contentType)
            ->where('content_type_id', $contentId)
            ->get(['id']);

        if ($items->isEmpty()) {
            return;
        }

        $deletedIds = $items->pluck('id')->toArray();

        WidgetItem::whereIn('parent_id', $deletedIds)
            ->update(['parent_id' => 0]);
        WidgetItem::whereIn('id', $deletedIds)->delete();

    }

}
