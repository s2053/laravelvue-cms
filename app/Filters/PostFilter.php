<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class PostFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'post_type',
        'post_category_id',
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

    protected function post_type(string|array $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('post_type', $value);
        } else {
            $this->builder->where('post_type', $value);
        }
    }

    protected function post_category_id(string|int|array|null $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('post_category_id', $value);
        } elseif ($value !== '' && $value !== null) {
            $this->builder->where('post_category_id', $value);
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
            $q->where('posts.title', 'like', "%{$value}%")
                ->orWhere('posts.status', 'like', "%{$value}%")
                ->orWhere('posts.created_at', 'like', "%{$value}%");
        });
    }

    /** Sorting Method **/

    public function sort(): Builder|\Illuminate\Database\Query\Builder
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
