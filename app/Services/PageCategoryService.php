<?php

namespace App\Services;

use App\Filters\PageCategoryFilter;
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

        $filter = new PageCategoryFilter($params);
        $query = $filter->apply($query);

        if ($all) {
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
        $category->delete();
    }


}
