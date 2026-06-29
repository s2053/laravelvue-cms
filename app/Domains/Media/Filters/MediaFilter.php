<?php

namespace App\Domains\Media\Filters;

use App\Filters\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class MediaFilter extends QueryFilter
{
    protected array $filters = [
        'status',
        'type',
        'visibility',
        'disk',
        'extension',
        'mime_type',
        'created_at',
        'search',
    ];

    protected function status(string|array $value): void
    {
        $values = is_array($value) ? $value : [$value];
        $bools = array_map(fn($item) => filter_var($item, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE), $values);
        $bools = array_values(array_filter($bools, fn($item) => $item !== null));

        if ($bools !== []) {
            $this->builder->whereIn('status', $bools);
        }
    }

    protected function type(string|array|null $value): void
    {
        $this->applyWhereIn('type', $value);
    }

    protected function visibility(string|array|null $value): void
    {
        $this->applyWhereIn('visibility', $value);
    }

    protected function disk(string|array|null $value): void
    {
        $this->applyWhereIn('disk', $value);
    }

    protected function extension(string|array|null $value): void
    {
        $this->applyWhereIn('extension', $value);
    }

    protected function mime_type(string|array|null $value): void
    {
        $this->applyWhereIn('mime_type', $value);
    }

    protected function search(string $value): void
    {
        $this->builder->where(function (Builder $query) use ($value) {
            $query->where('title', 'like', "%{$value}%")
                ->orWhere('alt_text', 'like', "%{$value}%")
                ->orWhere('filename', 'like', "%{$value}%")
                ->orWhere('original_name', 'like', "%{$value}%")
                ->orWhere('mime_type', 'like', "%{$value}%")
                ->orWhere('extension', 'like', "%{$value}%");
        });
    }

    public function sort(): Builder|\Illuminate\Database\Query\Builder
    {
        $sortable = ['created_at', 'title', 'filename', 'original_name', 'type', 'status', 'size'];

        $sortBy = $this->input('sort_by', 'created_at');
        $sortDir = $this->input('sort_dir', 'desc');

        if (!in_array($sortBy, $sortable, true)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortDir), ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        return $this->builder->orderBy($sortBy, $sortDir);
    }

    protected function applyWhereIn(string $column, string|array|null $value): void
    {
        if (empty($value)) {
            return;
        }

        $values = is_array($value) ? $value : [$value];

        $this->builder->whereIn($column, $values);
    }
}
