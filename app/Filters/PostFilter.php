<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class PostFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'post_type',
        'category_ids',
        'author_ids',
        'tag_ids',
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

    protected function author_ids(array|int|string|null $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('author_id', $value);
        } elseif ($value !== '' && $value !== null) {
            $this->builder->where('author_id', $value);
        }
    }


    protected function category_ids(array|int|string|null $value): void
    {
        if (is_array($value)) {
            $this->builder->whereHas('categories', function (Builder $q) use ($value) {
                $q->whereIn('post_categories.id', $value);
            });
        } elseif ($value !== '' && $value !== null) {
            $this->builder->whereHas('categories', function (Builder $q) use ($value) {
                $q->where('post_categories.id', $value);
            });
        }
    }

    protected function tag_ids(array|int|string|null $value): void
    {
        if (is_array($value)) {
            $this->builder->whereHas('tags', function (Builder $q) use ($value) {
                $q->whereIn('post_tags.id', $value);
            });
        } elseif ($value !== '' && $value !== null) {
            $this->builder->whereHas('tags', function (Builder $q) use ($value) {
                $q->where('post_tags.id', $value);
            });
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
                ->orWhere('posts.excerpt', 'like', "%{$value}%")
                ->orWhere('posts.content', 'like', "%{$value}%")
                ->orWhere('posts.status', 'like', "%{$value}%")
                ->orWhere('posts.created_at', 'like', "%{$value}%");
        });
    }

    /** Sorting Method **/

    public function sort(): Builder|\Illuminate\Database\Query\Builder
    {
        $sortable = ['created_at', 'title', 'status', 'post_type', 'visibility', 'categories', 'author'];

        $sortBy = $this->input('sort_by', 'created_at');
        $sortDir = $this->input('sort_dir', 'desc');

        if (!in_array($sortBy, $sortable)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortDir), ['asc', 'desc'])) {
            $sortDir = 'desc';
        }


        if ($sortBy === 'categories') {
            return $this->builder
                ->select('posts.*', \DB::raw('MIN(post_categories.title) as category_title'))
                ->leftJoin('post_category_pivot', 'posts.id', '=', 'post_category_pivot.post_id')
                ->leftJoin('post_categories', 'post_category_pivot.category_id', '=', 'post_categories.id')
                ->groupBy('posts.id')
                ->orderBy('category_title', $sortDir);
        }



        if ($sortBy === 'author') {
            return $this->builder
                ->leftJoin('users', 'posts.author_id', '=', 'users.id')
                ->orderBy('users.name', $sortDir)
                ->select('posts.*');
        }

        return $this->builder->orderBy($sortBy, $sortDir);
    }
}
