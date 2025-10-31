<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class WidgetFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'created_at',
        'widget_type',
        'content_type',
        'search',
    ];

    /** Filtering Methods **/

    protected function status(string|array $value): void
    {
        if (is_array($value)) {
            $bools = array_map(fn($v) => filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE), $value);
            $this->builder->whereIn('status', array_filter($bools, fn($v) => $v !== null));
        } else {
            $bool = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($bool !== null) {
                $this->builder->where('status', $bool);
            }
        }
    }

    protected function widget_type(array|string|null $value): void
    {
        if (empty($value))
            return;

        $values = is_array($value) ? $value : [$value];

        $this->builder->where(function (Builder $q) use ($values) {
            foreach ($values as $val) {
                $q->orWhere('widget_type', 'like', "%{$val}%");
            }
        });
    }

    protected function content_type(array|string|null $value): void
    {
        if (empty($value))
            return;

        $values = is_array($value) ? $value : [$value];

        $this->builder->where(function (Builder $q) use ($values) {
            foreach ($values as $val) {
                $q->orWhere('content_type', 'like', "%{$val}%");
            }
        });
    }


    protected function search(string $value): void
    {

        $this->builder->where(function (Builder $q) use ($value) {
            $q->where('title', 'like', "%{$value}%")
                ->orWhere('status', 'like', "%{$value}%")
                ->orWhere('slug', 'like', "%{$value}%")
                ->orWhere('created_at', 'like', "%{$value}%")
                ->orWhere('widget_type', 'like', "%{$value}%")
                ->orWhere('content_type', 'like', "%{$value}%");
        });
    }

    /** Sorting Method **/

    public function sort(): Builder|\Illuminate\Database\Query\Builder
    {
        $sortable = ['created_at', 'title', 'slug', 'status', 'widget_type'];

        $sortBy = $this->input('sort_by', 'created_at');
        $sortDir = $this->input('sort_dir', 'desc');

        if (!in_array($sortBy, $sortable)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortDir), ['asc', 'desc'])) {
            $sortDir = 'desc';
        }



        return $this->builder->orderBy($sortBy, $sortDir);
    }

}
