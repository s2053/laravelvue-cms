<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

$spaRoutes = ['login', 'register', 'forgot-password', 'reset-password'];

foreach ($spaRoutes as $route) {
    Route::get("/$route", function () {
        return view('dashboard');  // Your SPA blade view
    });
}
Route::get('/dashboard/{any?}', function () {
    return view(view: 'dashboard');
})->where('any', '.*')->name('dashboard');

// require __DIR__ . '/auth.php';
