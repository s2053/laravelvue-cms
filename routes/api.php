<?php

use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PermissionGroupController;
use App\Http\Controllers\RoleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware(['web', 'auth'])->group(function () {


    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);


    Route::apiResource('permissions', PermissionController::class);

    Route::apiResource('permission-groups', PermissionGroupController::class);


    Route::post('/roles/{role}/assign-permissions', [RoleController::class, 'assignPermissionsToRole']);
    Route::post('/users/{user}/assign-role', [RoleController::class, 'assignRoleToUser']);


});
