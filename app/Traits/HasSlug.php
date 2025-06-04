<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasSlug
{
    /**
     * Generate a unique slug for the model.
     *
     * @param string $title
     * @param string $slugColumn
     * @param int|null $ignoreId
     * @return string
     */
    public static function generateUniqueSlug(string $title, string $slugColumn = 'slug', ?int $ignoreId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $i = 1;

        while (
            static::where($slugColumn, $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    protected static function bootHasSlug()
    {
        static::saving(function ($model) {
            // If slug is empty, generate from title
            if (empty($model->slug) && !empty($model->title)) {
                $model->slug = static::generateUniqueSlug($model->title, 'slug', $model->id);
            }
            // If slug is set, check uniqueness (ignore current model)
            elseif (!empty($model->slug)) {
                $query = static::where('slug', $model->slug);
                if ($model->id) {
                    $query->where('id', '!=', $model->id);
                }
                if ($query->exists()) {
                    // Not unique, generate a unique one based on the provided slug
                    $model->slug = static::generateUniqueSlug($model->slug, 'slug', $model->id);
                }
            }
        });
    }
}
