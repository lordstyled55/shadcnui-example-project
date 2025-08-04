<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DosMonitorController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('DosMonitor/Dashboard');
    }

    public function storeMetrics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requests_per_second' => 'required|numeric|min:0',
            'total_requests' => 'required|numeric|min:0',
            'active_connections' => 'required|numeric|min:0',
            'target_url' => 'required|string|url',
            'timestamp' => 'required|numeric',
            'response_time_avg' => 'nullable|numeric|min:0',
            'success_rate' => 'nullable|numeric|min:0|max:100',
            'error_count' => 'nullable|numeric|min:0',
            'bytes_sent' => 'nullable|numeric|min:0',
            'bytes_received' => 'nullable|numeric|min:0',
        ]);

        $timestamp = $validated['timestamp'];
        $timeKey = date('Y-m-d H:i:s', $timestamp);

        // Store current metrics
        $currentMetrics = [
            'requests_per_second' => $validated['requests_per_second'],
            'total_requests' => $validated['total_requests'],
            'active_connections' => $validated['active_connections'],
            'target_url' => $validated['target_url'],
            'timestamp' => $timestamp,
            'response_time_avg' => $validated['response_time_avg'] ?? 0,
            'success_rate' => $validated['success_rate'] ?? 100,
            'error_count' => $validated['error_count'] ?? 0,
            'bytes_sent' => $validated['bytes_sent'] ?? 0,
            'bytes_received' => $validated['bytes_received'] ?? 0,
        ];

        // Store in cache for real-time access
        Cache::put('dos_current_metrics', $currentMetrics, 300); // 5 minutes

        // Store historical data (last 1000 entries)
        $historicalData = Cache::get('dos_historical_data', []);
        $historicalData[] = $currentMetrics;

        // Keep only last 1000 entries
        if (count($historicalData) > 1000) {
            $historicalData = array_slice($historicalData, -1000);
        }

        Cache::put('dos_historical_data', $historicalData, 3600); // 1 hour

        // Log for debugging
        Log::info('DOS metrics received', $currentMetrics);

        return response()->json([
            'status' => 'success',
            'message' => 'Metrics stored successfully',
            'timestamp' => $timestamp
        ]);
    }

    public function getCurrentMetrics(): JsonResponse
    {
        $metrics = Cache::get('dos_current_metrics', []);
        
        return response()->json([
            'status' => 'success',
            'data' => $metrics
        ]);
    }

    public function getHistoricalData(): JsonResponse
    {
        $data = Cache::get('dos_historical_data', []);
        
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function getStats(): JsonResponse
    {
        $historicalData = Cache::get('dos_historical_data', []);
        
        if (empty($historicalData)) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'peak_rps' => 0,
                    'total_requests' => 0,
                    'avg_rps' => 0,
                    'max_connections' => 0,
                    'avg_response_time' => 0,
                    'avg_success_rate' => 0,
                ]
            ]);
        }

        $rpsValues = array_column($historicalData, 'requests_per_second');
        $totalRequests = array_column($historicalData, 'total_requests');
        $connections = array_column($historicalData, 'active_connections');
        $responseTimes = array_column($historicalData, 'response_time_avg');
        $successRates = array_column($historicalData, 'success_rate');

        return response()->json([
            'status' => 'success',
            'data' => [
                'peak_rps' => max($rpsValues),
                'total_requests' => end($totalRequests) ?: 0,
                'avg_rps' => array_sum($rpsValues) / count($rpsValues),
                'max_connections' => max($connections),
                'avg_response_time' => array_sum($responseTimes) / count($responseTimes),
                'avg_success_rate' => array_sum($successRates) / count($successRates),
            ]
        ]);
    }
}