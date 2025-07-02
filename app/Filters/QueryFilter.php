<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

abstract class QueryFilter
{
    protected array $request;
    protected Builder $builder;

    protected array $filters = [];

    public function __construct(array $request)
    {
        $this->request = $request;
    }

    public function apply(Builder $builder): Builder
    {
        $this->builder = $builder;

        foreach ($this->filters as $filter) {
            if (method_exists($this, $filter) && $this->filled($filter)) {
                $this->{$filter}($this->input($filter));
            }
        }

        return $this->sort();
    }

    protected function input(string $key, $default = null)
    {
        $value = $this->request[$key] ?? $default;

        return is_string($value) ? trim($value) : $value;
    }

    protected function filled(string $key): bool
    {
        return isset($this->request[$key]) && $this->request[$key] !== '' && $this->request[$key] !== null;
    }
}
