<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DosMonitorController extends Controller
{
    /**
     * Store metrics from the DOS tool
     */
    public function storeMetrics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requests_per_second' => 'required|numeric|min:0',
            'total_requests' => 'required|numeric|min:0',
            'active_connections' => 'required|numeric|min:0',
            'average_response_time' => 'required|numeric|min:0',
            'success_rate' => 'required|numeric|min:0|max:100',
            'error_rate' => 'required|numeric|min:0|max:100',
            'target_url' => 'required|string|url',
            'status' => 'required|string|in:running,stopped,paused',
            'start_time' => 'nullable|string',
            'errors' => 'nullable|array',
            'response_codes' => 'nullable|array',
        ]);

        // Store current metrics in cache for real-time access
        $metrics = [
            'requests_per_second' => $validated['requests_per_second'],
            'total_requests' => $validated['total_requests'],
            'active_connections' => $validated['active_connections'],
            'average_response_time' => $validated['average_response_time'],
            'success_rate' => $validated['success_rate'],
            'error_rate' => $validated['error_rate'],
            'target_url' => $validated['target_url'],
            'status' => $validated['status'],
            'start_time' => $validated['start_time'],
            'timestamp' => now()->toISOString(),
            'errors' => $validated['errors'] ?? [],
            'response_codes' => $validated['response_codes'] ?? [],
        ];

        // Store in cache with 5 minute expiration
        Cache::put('dos_metrics', $metrics, 300);

        // Store historical data for charts
        $history = Cache::get('dos_history', []);
        $history[] = [
            'timestamp' => now()->toISOString(),
            'requests_per_second' => $validated['requests_per_second'],
            'total_requests' => $validated['total_requests'],
            'active_connections' => $validated['active_connections'],
            'average_response_time' => $validated['average_response_time'],
            'success_rate' => $validated['success_rate'],
            'error_rate' => $validated['error_rate'],
        ];

        // Keep only last 100 entries
        if (count($history) > 100) {
            $history = array_slice($history, -100);
        }

        Cache::put('dos_history', $history, 3600); // 1 hour

        Log::info('DOS metrics received', $metrics);

        return response()->json([
            'success' => true,
            'message' => 'Metrics stored successfully',
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Get current metrics
     */
    public function getMetrics(): JsonResponse
    {
        $metrics = Cache::get('dos_metrics', []);
        $history = Cache::get('dos_history', []);

        return response()->json([
            'current' => $metrics,
            'history' => $history,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Get historical data for charts
     */
    public function getHistory(): JsonResponse
    {
        $history = Cache::get('dos_history', []);

        return response()->json([
            'history' => $history,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Clear all metrics data
     */
    public function clearMetrics(): JsonResponse
    {
        Cache::forget('dos_metrics');
        Cache::forget('dos_history');

        return response()->json([
            'success' => true,
            'message' => 'All metrics cleared successfully',
        ]);
    }

    /**
     * Health check endpoint
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'uptime' => now()->diffInSeconds(now()->subDays(1)),
        ]);
    }

    /**
     * Get system status
     */
    public function status(): JsonResponse
    {
        $metrics = Cache::get('dos_metrics', []);
        
        return response()->json([
            'status' => $metrics['status'] ?? 'stopped',
            'is_running' => ($metrics['status'] ?? 'stopped') === 'running',
            'last_update' => $metrics['timestamp'] ?? null,
            'target_url' => $metrics['target_url'] ?? null,
        ]);
    }
}