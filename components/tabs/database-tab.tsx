'use client';

import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define the shape of your log data from SQLite
interface LogData {
  id: number;
  timestamp: string;
  system_mode: number;
  stepper_speed_level: number;
  count_inner: number;
  count_outer: number;
  stepper_inner_running: number;
  stepper_outer_running: number;
}

export function DatabaseTab() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM LOCAL API ---
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs'); // Calls your local Next.js API
      const data = await res.json();
      
      // Store data directly (API returns newest first)
      setLogs(data); 
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch logs", error);
      setLoading(false);
    }
  };

  // Auto-refresh every 2 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // Format data for the chart (Recharts needs Oldest -> Newest)
  const chartData = [...logs].reverse(); 

  return (
    <div className="space-y-4">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">System History (Offline)</h2>
        <Button onClick={fetchLogs} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* --- CHART SECTION --- */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Real-time tracking of Speed vs. Production Counts
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">Loading Graph...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(str) => format(new Date(str), 'HH:mm:ss')} 
                  minTickGap={30}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(str) => format(new Date(str), 'HH:mm:ss')}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                
                {/* Blue Line: Speed */}
                <Line 
                  type="monotone" 
                  dataKey="stepper_speed_level" 
                  stroke="#3b82f6" 
                  name="Motor Speed" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                
                {/* Green Line: Outer Production Count */}
                <Line 
                  type="monotone" 
                  dataKey="count_outer" 
                  stroke="#10b981" 
                  name="Production Count" 
                  strokeWidth={2} 
                  dot={false}
                />

                {/* Red Step Line: System Mode */}
                <Line 
                  type="step" 
                  dataKey="system_mode" 
                  stroke="#ef4444" 
                  name="Mode (1=Man, 0=Auto)" 
                  strokeWidth={1} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* --- TABLE SECTION --- */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Logs</CardTitle>
          <CardDescription>
            Last 100 recorded events (Newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Mode</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Speed</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Running Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Counts (In/Out)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-mono">
                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      
                      {/* LOGIC FIX: 1 = Manual, 0 = Auto */}
                      <td className="p-4 align-middle">
                        {log.system_mode === 1 ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                            MANUAL
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                            AUTO
                          </Badge>
                        )}
                      </td>

                      <td className="p-4 align-middle font-semibold text-blue-600">
                        Lvl {log.stepper_speed_level}
                      </td>
                      <td className="p-4 align-middle">
                         <div className="flex gap-2">
                            <span className={log.stepper_inner_running ? "text-green-600 font-bold" : "text-gray-400"}>Inner</span>
                            <span className="text-gray-300">|</span>
                            <span className={log.stepper_outer_running ? "text-green-600 font-bold" : "text-gray-400"}>Outer</span>
                         </div>
                      </td>
                      <td className="p-4 align-middle">
                        {log.count_inner} / {log.count_outer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}