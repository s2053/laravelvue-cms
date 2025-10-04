<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class WidgetFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'created_at',
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



    protected function search(string $value): void
    {

        $this->builder->where(function (Builder $q) use ($value) {
            $q->where('title', 'like', "%{$value}%")
                ->orWhere('status', 'like', "%{$value}%")
                ->orWhere('created_at', 'like', "%{$value}%");
        });
    }

    /** Sorting Method **/

    public function sort(): Builder|\Illuminate\Database\Query\Builder
    {
        $sortable = ['created_at', 'title', 'status',];

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
