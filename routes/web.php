<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
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

Route::get('/dos-monitor', function () {
    return Inertia::render('DosMonitor');
})->name('dos-monitor');

// DOS Monitor API routes (no authentication required for external access)
Route::prefix('api/dos')->group(function () {
    Route::post('/metrics', [App\Http\Controllers\DosMonitorController::class, 'storeMetrics']);
    Route::get('/metrics', [App\Http\Controllers\DosMonitorController::class, 'getMetrics']);
    Route::get('/history', [App\Http\Controllers\DosMonitorController::class, 'getHistory']);
    Route::delete('/metrics', [App\Http\Controllers\DosMonitorController::class, 'clearMetrics']);
    Route::get('/health', [App\Http\Controllers\DosMonitorController::class, 'health']);
    Route::get('/status', [App\Http\Controllers\DosMonitorController::class, 'status']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('users', UserController::class);
});

require __DIR__.'/auth.php';
