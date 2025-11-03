<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\CustomEmailVerificationController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\PostCategoryController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PageCategoryController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PermissionGroupController;
use App\Http\Controllers\Api\PostTagController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SiteInfoController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WidgetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/email/verification-notification', [CustomEmailVerificationController::class, 'resend']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

});

Route::middleware(['auth:sanctum', 'verified.api'])->group(function () {

    // Route::get('/roles', [RoleController::class, 'index']);
    // Route::post('/roles', [RoleController::class, 'store']);
    // Route::get('/roles/{id}', [RoleController::class, 'show']);
    // Route::put('/roles/{id}', [RoleController::class, 'update']);
    // Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    Route::apiResource('roles', RoleController::class);
    Route::post('/roles/bulk-update', [RoleController::class, 'bulkUpdate']);

    Route::apiResource('permissions', PermissionController::class);
    Route::post('/permissions/bulk-update', [PermissionController::class, 'bulkUpdate']);


    Route::apiResource('permission-groups', PermissionGroupController::class);
    Route::post('/permission-groups/bulk-update', [PermissionGroupController::class, 'bulkUpdate']);

    // User management routes
    Route::apiResource('users', UserController::class);
    Route::post('/users/bulk-update', [UserController::class, 'bulkUpdate'])->name('users.bulk-update');
    Route::put('/users/{user}/details', [UserController::class, 'updateDetails']);
    Route::put('/users/{user}/password', [UserController::class, 'updatePassword']);
    Route::put('/users/{user}/roles', [UserController::class, 'updateRoles']);

    Route::apiResource('widgets', WidgetController::class);
    Route::post('/widgets/bulk-update', [WidgetController::class, 'bulkUpdate']);
    Route::post('/widgets/{widget}/widget-items', [WidgetController::class, 'updateWidgetItems']);


    Route::apiResource('page-categories', PageCategoryController::class);
    Route::post('/page-categories/bulk-update', [PageCategoryController::class, 'bulkUpdate']);

    Route::apiResource('pages', PageController::class);
    Route::post('/pages/bulk-update', [PageController::class, 'bulkUpdate'])->name('pages.bulk-update');

    Route::get('/post-tags/get-list', action: [PostTagController::class, 'options']);
    Route::apiResource('post-tags', PostTagController::class);
    Route::post('/post-tags/bulk-update', [PostTagController::class, 'bulkUpdate']);

    Route::get('/post-categories/get-list', action: [PostCategoryController::class, 'options']);
    Route::apiResource('post-categories', PostCategoryController::class);
    Route::post('/post-categories/bulk-update', [PostCategoryController::class, 'bulkUpdate']);

    Route::apiResource('posts', PostController::class);
    Route::post('/posts/bulk-update', [PostController::class, 'bulkUpdate'])->name('posts.bulk-update');

    Route::prefix('site-info')->group(function () {
        Route::get('/', [SiteInfoController::class, 'show']);
        Route::post('/', [SiteInfoController::class, 'update']);
    });



});
