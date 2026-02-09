<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialController;
use Illuminate\Support\Facades\Route;

Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);

    Route::get('/auth/{provider}/redirect', [SocialController::class, 'redirect'])->name('social.redirect');
    Route::get('/auth/{provider}/callback', [SocialController::class, 'callback'])->name('social.callback');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
