<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/', function () {
    return view('welcome');
});



Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect(config('app.frontend_url') . '/login?verified=1');
})->middleware(['signed'])->name('verification.verify');

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
