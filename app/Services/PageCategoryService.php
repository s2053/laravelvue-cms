<?php

namespace App\Services;

use App\Enums\Widgets\ContentType;
use App\Filters\CategoryFilter;
use App\Models\PageCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PageCategoryService
{
    /**
     * List page categories with optional pagination.
     *
     * @param int|null $perPage
     * @param bool $all
     * @return LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function list(array $params, int $perPage = 25, bool $all = false)
    {

        $query = PageCategory::query();

        $filter = new CategoryFilter($params);
        $query = $filter->apply($query);

        if ($all) {
            if ($perPage > 0) {
                return $query->take($perPage)->get();
            }
            return $query->get();
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new page category.
     */
    public function create(array $data): PageCategory
    {
        return PageCategory::create($data);
    }


    /**
     * Get a specific page category.
     */
    public function show(PageCategory $category): PageCategory
    {
        return $category;
    }
    /**
     * Update an existing page category.
     */
    public function update(PageCategory $category, array $data): PageCategory
    {
        $category->update($data);
        return $category;
    }

    /**
     * Delete a page category.
     */
    public function delete(PageCategory $category): void
    {
        app(WidgetService::class)->deleteRelatedItems(ContentType::PAGE_CATEGORY, $category->id);

        $category->delete();
    }


    /**
     * Bulk update.
     *
     * @param array $validated
     * @return array
     */
    public function bulkUpdate(array $validated): array
    {
        $recs = PageCategory::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'delete':
                $recs = $recs->get();
                foreach ($recs as $rec) {
                    $this->delete($rec);
                }
                return ['message' => 'Pages deleted.'];

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

}
