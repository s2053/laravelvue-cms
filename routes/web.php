<?php

use App\Http\Controllers\Api\Auth\CustomEmailVerificationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/email/verify/{id}/{hash}', CustomEmailVerificationController::class)
    ->middleware('signed')
    ->name('verification.verify');

$spaRoutes = ['login', 'register', 'verify-email', 'forgot-password', 'reset-password'];

foreach ($spaRoutes as $route) {
    Route::get("/$route", function () {
        return view('dashboard');
    });
}
Route::get('/dashboard/{any?}', function () {
    return view(view: 'dashboard');
})->where('any', '.*')->name('dashboard');

// require __DIR__ . '/auth.php';
