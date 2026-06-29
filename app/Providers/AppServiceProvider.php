<?php

namespace App\Providers;

use App\Domains\Media\Contracts\ImageProcessorContract;
use App\Domains\Media\Contracts\MediaStorageContract;
use App\Domains\Media\Services\InterventionImageProcessorService;
use App\Domains\Media\Services\LaravelMediaStorageService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(MediaStorageContract::class, LaravelMediaStorageService::class);
        $this->app->bind(ImageProcessorContract::class, InterventionImageProcessorService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
