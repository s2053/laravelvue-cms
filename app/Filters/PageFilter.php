<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class PageFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'page_type',
        'page_category_id',
        'visibility',
        'search',
    ];




    /** Filtering Methods **/

    protected function status(string|array $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('status', $value);
        } else {
            $this->builder->where('status', $value);
        }
    }

    protected function page_type(string|array $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('page_type', $value);
        } else {
            $this->builder->where('page_type', $value);
        }
    }

    protected function page_category_id(string|int|array|null $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('page_category_id', $value);
        } elseif ($value !== '' && $value !== null) {
            $this->builder->where('page_category_id', $value);
        }
    }

    protected function visibility(string|array $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('visibility', $value);
        } else {
            $this->builder->where('visibility', $value);
        }
    }

    protected function search(string $value): void
    {

        $this->builder->where(function (Builder $q) use ($value) {
            $q->where('pages.title', 'like', "%{$value}%")
                ->orWhere('pages.status', 'like', "%{$value}%")
                ->orWhere('pages.created_at', 'like', "%{$value}%");
        });
    }

    /** Sorting Method **/

    public function sort(): Builder
    {
        $sortable = ['created_at', 'title', 'status', 'page_type', 'visibility', 'category'];

        $sortBy = $this->input('sort_by', 'created_at');
        $sortDir = $this->input('sort_dir', 'desc');

        if (!in_array($sortBy, $sortable)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortDir), ['asc', 'desc'])) {
            $sortDir = 'desc';
        }

        if ($sortBy === 'category') {
            return $this->builder
                ->leftJoin('page_categories', 'pages.page_category_id', '=', 'page_categories.id')
                ->orderBy('page_categories.title', $sortDir)
                ->select('pages.*');
        }

        return $this->builder->orderBy($sortBy, $sortDir);
    }
}
