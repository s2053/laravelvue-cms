<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class PageFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'page_type',
        'category',
        'visibility',
        'search',
    ];

    /** Filtering Methods **/

    protected function status(string $value): void
    {
        $this->builder->where('status', $value);
    }

    protected function page_type(string $value): void
    {
        $this->builder->where('page_type', $value);
    }

    protected function category($value): void
    {
        $this->builder->where('page_category_id', $value);
    }

    protected function visibility(string $value): void
    {
        $this->builder->where('visibility', $value);
    }

    protected function search(string $value): void
    {
        $this->builder->where(function (Builder $q) use ($value) {
            $q->where('title', 'like', "%{$value}%")
              ->orWhere('status', 'like', "%{$value}%")
              ->orWhere('created_at', 'like', "%{$value}%");
        });
    }

    /** Sorting Method **/

    public function sort(): Builder
    {
        $sortBy = $this->request->input('sort_by', 'created_at');
        $sortDir = $this->request->input('sort_dir', 'desc');

        if ($sortBy === 'category') {
            return $this->builder
                ->join('page_categories', 'pages.page_category_id', '=', 'page_categories.id')
                ->orderBy('page_categories.title', $sortDir)
                ->select('pages.*');
        }

        return $this->builder->orderBy($sortBy, $sortDir);
    }
}
