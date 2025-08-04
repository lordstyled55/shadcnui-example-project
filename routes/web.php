<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DosMonitorController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/cozy', function () {
    return Inertia::render('CozySpace');
})->name('cozy-space');

// DOS Monitor Routes
Route::get('/dos-monitor', [DosMonitorController::class, 'dashboard'])->name('dos-monitor');
Route::post('/api/dos-metrics', [DosMonitorController::class, 'storeMetrics']);
Route::get('/api/dos-metrics/current', [DosMonitorController::class, 'getCurrentMetrics']);
Route::get('/api/dos-metrics/historical', [DosMonitorController::class, 'getHistoricalData']);
Route::get('/api/dos-metrics/stats', [DosMonitorController::class, 'getStats']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('users', UserController::class);
});

require __DIR__.'/auth.php';
