import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import { 
    Activity, 
    Zap, 
    Users, 
    Globe, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    Download, 
    Upload,
    Target,
    BarChart3,
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface DosMetrics {
    requests_per_second: number;
    total_requests: number;
    active_connections: number;
    target_url: string;
    timestamp: number;
    response_time_avg: number;
    success_rate: number;
    error_count: number;
    bytes_sent: number;
    bytes_received: number;
}

interface DosStats {
    peak_rps: number;
    total_requests: number;
    avg_rps: number;
    max_connections: number;
    avg_response_time: number;
    avg_success_rate: number;
}

const Dashboard: React.FC = () => {
    const [currentMetrics, setCurrentMetrics] = useState<DosMetrics | null>(null);
    const [historicalData, setHistoricalData] = useState<DosMetrics[]>([]);
    const [stats, setStats] = useState<DosStats | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchCurrentMetrics = async () => {
        try {
            const response = await fetch('/api/dos-metrics/current');
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                setCurrentMetrics(data.data);
                setLastUpdate(new Date());
                setIsConnected(true);
            }
        } catch (error) {
            console.error('Error fetching current metrics:', error);
            setIsConnected(false);
        }
    };

    const fetchHistoricalData = async () => {
        try {
            const response = await fetch('/api/dos-metrics/historical');
            const data = await response.json();
            if (data.status === 'success') {
                setHistoricalData(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/dos-metrics/stats');
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const refreshAll = () => {
        fetchCurrentMetrics();
        fetchHistoricalData();
        fetchStats();
    };

    useEffect(() => {
        refreshAll();

        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                refreshAll();
            }, 1000); // Update every second
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh]);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleTimeString();
    };

    const getStatusColor = (successRate: number): string => {
        if (successRate >= 90) return 'bg-green-500';
        if (successRate >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const chartData = historicalData.slice(-50).map(item => ({
        time: formatTime(item.timestamp),
        rps: item.requests_per_second,
        connections: item.active_connections,
        responseTime: item.response_time_avg,
        successRate: item.success_rate,
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">DOS Tool Monitor</h1>
                        <p className="text-gray-600 mt-1">Real-time monitoring dashboard for your DOS testing tool</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                        </Button>
                        <Button onClick={refreshAll} size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {lastUpdate && (
                    <Alert>
                        <AlertDescription>
                            Last updated: {lastUpdate.toLocaleString()}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Current Metrics Cards */}
                {currentMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentMetrics.requests_per_second.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.peak_rps && `Peak: ${stats.peak_rps.toLocaleString()}`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentMetrics.total_requests.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    Running total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentMetrics.active_connections.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.max_connections && `Max: ${stats.max_connections.toLocaleString()}`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentMetrics.success_rate.toFixed(1)}%</div>
                                <Progress value={currentMetrics.success_rate} className="mt-2" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Target URL and Response Time */}
                {currentMetrics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="w-5 h-5 mr-2" />
                                    Target Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Target URL</label>
                                        <p className="text-sm text-gray-900 break-all">{currentMetrics.target_url}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Response Time (avg)</span>
                                        <span className="text-sm font-medium">
                                            {currentMetrics.response_time_avg.toFixed(2)}ms
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Errors</span>
                                        <span className="text-sm font-medium text-red-600">
                                            {currentMetrics.error_count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Data Transfer
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Upload className="w-4 h-4 mr-2 text-blue-500" />
                                            <span className="text-sm text-gray-600">Bytes Sent</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {formatBytes(currentMetrics.bytes_sent)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Download className="w-4 h-4 mr-2 text-green-500" />
                                            <span className="text-sm text-gray-600">Bytes Received</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {formatBytes(currentMetrics.bytes_received)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Transfer</span>
                                        <span className="text-sm font-medium">
                                            {formatBytes(currentMetrics.bytes_sent + currentMetrics.bytes_received)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts */}
                <Tabs defaultValue="rps" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="rps">Requests/sec</TabsTrigger>
                        <TabsTrigger value="connections">Connections</TabsTrigger>
                        <TabsTrigger value="response-time">Response Time</TabsTrigger>
                        <TabsTrigger value="success-rate">Success Rate</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rps" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requests per Second Over Time</CardTitle>
                                <CardDescription>Real-time graph showing request rate trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area 
                                            type="monotone" 
                                            dataKey="rps" 
                                            stroke="#3b82f6" 
                                            fill="#3b82f6" 
                                            fillOpacity={0.3} 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="connections" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Connections Over Time</CardTitle>
                                <CardDescription>Number of concurrent connections</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line 
                                            type="monotone" 
                                            dataKey="connections" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="response-time" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Response Time Over Time</CardTitle>
                                <CardDescription>Average response time in milliseconds</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line 
                                            type="monotone" 
                                            dataKey="responseTime" 
                                            stroke="#f59e0b" 
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="success-rate" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Success Rate Over Time</CardTitle>
                                <CardDescription>Percentage of successful requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar 
                                            dataKey="successRate" 
                                            fill="#10b981" 
                                            fillOpacity={0.8}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Statistics Summary */}
                {stats && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Performance Statistics
                            </CardTitle>
                            <CardDescription>Summary of all-time performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.peak_rps.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Peak RPS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.avg_rps.toFixed(1)}
                                    </div>
                                    <div className="text-sm text-gray-600">Avg RPS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {stats.max_connections.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Max Connections</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {stats.avg_response_time.toFixed(1)}ms
                                    </div>
                                    <div className="text-sm text-gray-600">Avg Response</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {stats.avg_success_rate.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Avg Success</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-600">
                                        {stats.total_requests.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Requests</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Dashboard;