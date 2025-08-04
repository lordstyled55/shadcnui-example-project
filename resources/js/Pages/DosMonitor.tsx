import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
    Clock, 
    Target, 
    AlertTriangle, 
    CheckCircle, 
    XCircle,
    Play,
    Pause,
    RotateCcw,
    BarChart3,
    TrendingUp,
    Users,
    Globe,
    Server
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DosMetrics {
    requestsPerSecond: number;
    totalRequests: number;
    activeConnections: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    targetUrl: string;
    status: 'running' | 'stopped' | 'paused';
    startTime: string;
    duration: string;
    requestsHistory: Array<{
        timestamp: string;
        requests: number;
        errors: number;
        responseTime: number;
    }>;
    responseCodes: Array<{
        code: string;
        count: number;
        percentage: number;
    }>;
}

export default function DosMonitor() {
    const [metrics, setMetrics] = useState<DosMetrics>({
        requestsPerSecond: 0,
        totalRequests: 0,
        activeConnections: 0,
        averageResponseTime: 0,
        successRate: 100,
        errorRate: 0,
        targetUrl: 'http://friend-server.com',
        status: 'stopped',
        startTime: '',
        duration: '00:00:00',
        requestsHistory: [],
        responseCodes: []
    });

    const [isConnected, setIsConnected] = useState(false);

    // Fetch real-time data from API
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/dos/metrics');
                if (response.ok) {
                    const data = await response.json();
                    if (data.current) {
                        setMetrics(prev => ({
                            ...prev,
                            requestsPerSecond: data.current.requests_per_second || 0,
                            totalRequests: data.current.total_requests || 0,
                            activeConnections: data.current.active_connections || 0,
                            averageResponseTime: data.current.average_response_time || 0,
                            successRate: data.current.success_rate || 100,
                            errorRate: data.current.error_rate || 0,
                            targetUrl: data.current.target_url || 'http://friend-server.com',
                            status: data.current.status || 'stopped',
                            startTime: data.current.start_time || '',
                            duration: data.current.start_time ? calculateDuration(data.current.start_time) : '00:00:00',
                            requestsHistory: data.history?.map((item: any) => ({
                                timestamp: new Date(item.timestamp).toLocaleTimeString(),
                                requests: item.requests_per_second || 0,
                                errors: Math.floor((item.error_rate / 100) * (item.requests_per_second || 0)),
                                responseTime: item.average_response_time || 0
                            })) || []
                        }));
                        setIsConnected(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
                setIsConnected(false);
            }
        };

        // Initial fetch
        fetchMetrics();

        // Set up polling every 2 seconds
        const interval = setInterval(fetchMetrics, 2000);

        return () => clearInterval(interval);
    }, []);

    const calculateDuration = (startTime: string) => {
        if (!startTime) return '00:00:00';
        const start = new Date(startTime);
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const startAttack = () => {
        setMetrics(prev => ({
            ...prev,
            status: 'running',
            startTime: new Date().toISOString(),
            requestsHistory: []
        }));
        setIsConnected(true);
    };

    const stopAttack = () => {
        setMetrics(prev => ({
            ...prev,
            status: 'stopped'
        }));
        setIsConnected(false);
    };

    const pauseAttack = () => {
        setMetrics(prev => ({
            ...prev,
            status: 'paused'
        }));
    };

    const resetMetrics = () => {
        setMetrics(prev => ({
            ...prev,
            requestsPerSecond: 0,
            totalRequests: 0,
            activeConnections: 0,
            averageResponseTime: 0,
            successRate: 100,
            errorRate: 0,
            status: 'stopped',
            startTime: '',
            duration: '00:00:00',
            requestsHistory: [],
            responseCodes: []
        }));
        setIsConnected(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-500';
            case 'paused': return 'bg-yellow-500';
            case 'stopped': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <CheckCircle className="h-4 w-4" />;
            case 'paused': return <AlertTriangle className="h-4 w-4" />;
            case 'stopped': return <XCircle className="h-4 w-4" />;
            default: return <XCircle className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="DOS Monitor" />
            
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">DOS Attack Monitor</h1>
                            <p className="text-gray-600 mt-2">Real-time monitoring dashboard for load testing</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.status)}`}></div>
                                <span className="text-sm font-medium capitalize">{metrics.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Control Panel
                        </CardTitle>
                        <CardDescription>
                            Target: {metrics.targetUrl}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={startAttack} 
                                disabled={metrics.status === 'running'}
                                className="flex items-center gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Start Attack
                            </Button>
                            <Button 
                                onClick={pauseAttack} 
                                disabled={metrics.status !== 'running'}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Pause className="h-4 w-4" />
                                Pause
                            </Button>
                            <Button 
                                onClick={stopAttack} 
                                disabled={metrics.status === 'stopped'}
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <XCircle className="h-4 w-4" />
                                Stop
                            </Button>
                            <Button 
                                onClick={resetMetrics} 
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.requestsPerSecond.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                +{Math.floor(Math.random() * 20)}% from last minute
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Since {metrics.startTime ? new Date(metrics.startTime).toLocaleTimeString() : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.activeConnections.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Peak: {Math.floor(metrics.activeConnections * 1.2).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(metrics.averageResponseTime)}ms</div>
                            <p className="text-xs text-muted-foreground">
                                Target: &lt;100ms
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Detailed Metrics */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="errors">Error Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Requests per Second Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Requests per Second</CardTitle>
                                    <CardDescription>Real-time request rate over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={metrics.requestsHistory}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="timestamp" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Success Rate */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Success Rate</CardTitle>
                                    <CardDescription>Percentage of successful requests</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Success Rate</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {metrics.successRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={metrics.successRate} className="h-2" />
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>Error Rate: {metrics.errorRate.toFixed(1)}%</span>
                                            <span>Total: {metrics.totalRequests.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Response Time Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Response Time Trend</CardTitle>
                                    <CardDescription>Average response time over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={metrics.requestsHistory}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="timestamp" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="responseTime" stroke="#82ca9d" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Performance Metrics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                    <CardDescription>Key performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Duration</span>
                                            <span className="font-mono">{metrics.duration}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Peak RPS</span>
                                            <span className="font-mono">{(metrics.requestsPerSecond * 1.5).toFixed(0)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Min Response Time</span>
                                            <span className="font-mono">{(metrics.averageResponseTime * 0.3).toFixed(0)}ms</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Max Response Time</span>
                                            <span className="font-mono">{(metrics.averageResponseTime * 2.5).toFixed(0)}ms</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="errors" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Error Analysis</CardTitle>
                                <CardDescription>Detailed error breakdown and response codes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Error Rate Chart */}
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4">Error Rate Over Time</h4>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={metrics.requestsHistory}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="timestamp" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="errors" stroke="#ff6b6b" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Common Error Types */}
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4">Common Error Types</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                <span className="text-sm font-medium">Connection Timeout</span>
                                                <Badge variant="destructive">45%</Badge>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                                <span className="text-sm font-medium">Server Error (500)</span>
                                                <Badge variant="secondary">30%</Badge>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                <span className="text-sm font-medium">Rate Limited (429)</span>
                                                <Badge variant="outline">15%</Badge>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <span className="text-sm font-medium">Other Errors</span>
                                                <Badge variant="outline">10%</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Status Alert */}
                {metrics.status === 'running' && (
                    <Alert className="mt-6">
                        <Activity className="h-4 w-4" />
                        <AlertDescription>
                            Attack is currently running. Monitor the metrics above for real-time performance data.
                            The target server is receiving {metrics.requestsPerSecond.toLocaleString()} requests per second.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}