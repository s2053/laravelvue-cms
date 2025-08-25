<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\CustomEmailVerificationController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\PostCategoryController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\PageCategoryController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PermissionGroupController;
use App\Http\Controllers\Api\PostTagController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
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

    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);


    Route::apiResource('permissions', PermissionController::class);

    Route::apiResource('permission-groups', PermissionGroupController::class);





    // User management routes
    Route::apiResource('users', UserController::class);
    Route::put('/users/{id}/details', [UserController::class, 'updateDetails']);
    Route::put('/users/{id}/password', [UserController::class, 'updatePassword']);
    Route::put('/users/{id}/roles', [UserController::class, 'updateRoles']);


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




});
