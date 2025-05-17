<?php

use App\Http\Controllers\RoleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware(['web', 'auth'])->group(function () {


    Route::get('/roles', [RoleController::class, 'roles']);
    Route::post('/roles', [RoleController::class, 'createRole']);
    Route::put('/roles/{id}', [RoleController::class, 'updateRole']);
    Route::delete('/roles/{id}', [RoleController::class, 'deleteRole']);
    Route::get('/roles/{id}', [RoleController::class, 'getRoleById']);

    Route::get('/permissions', [RoleController::class, 'permissions']);
    Route::post('/permissions', [RoleController::class, 'createPermission']);

    Route::post('/roles/{role}/assign-permissions', [RoleController::class, 'assignPermissionsToRole']);
    Route::post('/users/{user}/assign-role', [RoleController::class, 'assignRoleToUser']);


});
