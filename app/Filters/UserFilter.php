<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class UserFilter extends QueryFilter
{
    protected array $filters = [
        'name',
        'email',
        'role_ids',
        'email_verified_status',
        'status',
        'search',
    ];

    /** Filtering Methods **/

    protected function name(array|string $value): void
    {
        if (empty($value))
            return;

        $values = is_array($value) ? $value : [$value];

        $this->builder->where(function (Builder $q) use ($values) {
            foreach ($values as $val) {
                $q->orWhere('users.name', 'like', "%{$val}%");
            }
        });
    }

    protected function email(array|string $value): void
    {
        if (empty($value))
            return;

        $values = is_array($value) ? $value : [$value];

        $this->builder->where(function (Builder $q) use ($values) {
            foreach ($values as $val) {
                $q->orWhere('users.email', 'like', "%{$val}%");
            }
        });
    }

    protected function role_ids(array|int|string|null $value): void
    {
        if (is_array($value)) {
            $this->builder->whereHas('roles', fn(Builder $q) => $q->whereIn('roles.id', $value));
        } elseif ($value !== '' && $value !== null) {
            $this->builder->whereHas('roles', fn(Builder $q) => $q->where('roles.id', $value));
        }
    }

    protected function email_verified_status(string|bool|array|null $value): void
    {
        if ($value === null || $value === '')
            return;

        if (is_array($value)) {
            if (count($value) > 1)
                return;
            $value = $value[0];
        }

        $isVerified = filter_var($value, FILTER_VALIDATE_BOOLEAN);

        if ($isVerified) {
            $this->builder->whereNotNull('users.email_verified_at');
        } else {
            $this->builder->whereNull('users.email_verified_at');
        }
    }

    protected function status(string|bool|array $value): void
    {
        if (is_array($value)) {
            $this->builder->whereIn('users.status', array_map(fn($v) => (int) filter_var($v, FILTER_VALIDATE_BOOLEAN), $value));
        } else {
            $this->builder->where('users.status', (int) filter_var($value, FILTER_VALIDATE_BOOLEAN));
        }
    }


    protected function search(string $value): void
    {
        if (empty($value))
            return;

        $this->builder->where(function (Builder $q) use ($value) {
            $q->where('users.name', 'like', "%{$value}%")
                ->orWhere('users.email', 'like', "%{$value}%")
                ->orWhere('users.created_at', 'like', "%{$value}%")
                ->orWhereHas(
                    'roles',
                    fn(Builder $qr) =>
                    $qr->where('roles.name', 'like', "%{$value}%")
                );
        });
    }

    /** Sorting Method **/

    public function sort(): Builder|\Illuminate\Database\Query\Builder
    {
        $sortable = ['id', 'name', 'email', 'email_verified_at', 'status', 'roles'];

        $sortBy = $this->input('sort_by', 'name');
        $sortDir = strtolower($this->input('sort_dir', 'asc'));

        if (!in_array($sortBy, $sortable)) {
            $sortBy = 'name';
        }

        if (!in_array($sortDir, ['asc', 'desc'])) {
            $sortDir = 'asc';
        }

        if ($sortBy === 'roles') {
            return $this->builder
                ->select('users.*', DB::raw('MIN(roles.name) as role_name'))
                ->leftJoin('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->groupBy('users.id')
                ->orderBy('role_name', $sortDir);
        }

        return $this->builder->orderBy($sortBy, $sortDir);
    }
}
