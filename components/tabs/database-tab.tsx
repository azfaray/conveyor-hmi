'use client';

import { useState } from "react";
import { getFilteredLogs } from "@/app/actions"; // Cuma panggil Logs biasa
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "../ui/checkbox"; // Relative path (Aman)
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Calendar, Search, Filter } from "lucide-react";

// --- 1. DEFINISI SEMUA KOLOM (Sesuai Schema.ts) ---

type FieldType = 'number' | 'boolean' | 'enum';

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  color: string;
}

const ALL_FIELDS: FieldConfig[] = [
  // --- SENSORS (Boolean) ---
  { key: 'irSensor', label: 'IR Sensor', type: 'boolean', color: '#c2410c' },
  { key: 'inductiveSensor', label: 'Inductive', type: 'boolean', color: '#be185d' },
  { key: 'capacitiveSensor', label: 'Capacitive', type: 'boolean', color: '#a16207' },
  { key: 'positionInnerSensor', label: 'Pos Inner', type: 'boolean', color: '#166534' },
  { key: 'positionOuterSensor', label: 'Pos Outer', type: 'boolean', color: '#15803d' },

  // --- SENSORS (Numeric) ---
  { key: 'motorSpeedSensor', label: 'Motor Speed', type: 'number', color: '#2563eb' },
  { key: 'objectInnerCount', label: 'Count Inn', type: 'number', color: '#7c3aed' },
  { key: 'objectOuterCount', label: 'Count Out', type: 'number', color: '#a78bfa' },

  // --- ACTUATORS (DL/LD) ---
  { key: 'dlPush', label: 'DL Push', type: 'boolean', color: '#16a34a' },
  { key: 'dlPull', label: 'DL Pull', type: 'boolean', color: '#dc2626' },
  { key: 'ldPush', label: 'LD Push', type: 'boolean', color: '#16a34a' },
  { key: 'ldPull', label: 'LD Pull', type: 'boolean', color: '#dc2626' },

  // --- STEPPERS ---
  { key: 'stepperInnerRotate', label: 'Stp Inner', type: 'boolean', color: '#3b82f6' },
  { key: 'stepperOuterRotate', label: 'Stp Outer', type: 'boolean', color: '#8b5cf6' },
  { key: 'stepperSpeedSetting', label: 'Stp Speed', type: 'number', color: '#0ea5e9' },
];

export function DatabaseTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Default selected: Motor Speed and Counts
  const [selectedFields, setSelectedFields] = useState<string[]>(['motorSpeedSensor', 'objectInnerCount']);

  // --- FETCH DATA LOGIC ---
  const handleSearch = async () => {
    if (!startDate || !endDate) return alert("Pilih tanggal dulu!");
    setLoading(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Cuma panggil Logs biasa
      const rawData = await getFilteredLogs(start, end);

      // PRE-PROCESSING
      const processed = rawData.map((item: any) => {
        const newItem: any = { ...item };
        
        // 1. Format Waktu
        newItem.timeStr = new Date(item.createdAt).toLocaleTimeString('en-GB');

        // 2. Convert Boolean -> Number (Untuk Grafik)
        ALL_FIELDS.forEach(field => {
          const val = item[field.key];
          
          if (field.type === 'boolean') {
            newItem[field.key] = val ? 1 : 0;
          } 
          // Enum removed from ALL_FIELDS
        });

        return newItem;
      });

      setData(processed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (key: string) => {
    setSelectedFields(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FILTER & CONFIG */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-5 h-5" /> Database Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* A. Date Range */}
          <div className="flex flex-wrap items-end gap-4">
             <div className="space-y-1">
               <label className="text-xs font-bold text-gray-500">Start Time</label>
               <input type="datetime-local" className="border p-2 rounded text-sm bg-white dark:bg-slate-900 w-full" 
                 value={startDate} onChange={e => setStartDate(e.target.value)} />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-bold text-gray-500">End Time</label>
               <input type="datetime-local" className="border p-2 rounded text-sm bg-white dark:bg-slate-900 w-full" 
                 value={endDate} onChange={e => setEndDate(e.target.value)} />
             </div>
             <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
               {loading ? "Loading..." : <><Search className="w-4 h-4 mr-2" /> Load Data</>}
             </Button>
          </div>

          <hr />

          {/* B. Field Selection (Grid Rapat) */}
          <div>
            <div className="flex justify-between items-center mb-3">
               <label className="text-sm font-bold">Pilih Grafik:</label>
               <button onClick={() => setSelectedFields([])} className="text-xs text-red-500 hover:underline">Uncheck All</button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {ALL_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                  <Checkbox 
                    id={field.key} 
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <label htmlFor={field.key} className="text-[11px] font-medium cursor-pointer flex-1 truncate" title={field.label} style={{ color: field.color }}>
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. GRAFIK (CHART) */}
      <Card>
        <CardHeader><CardTitle>Trend Visualization</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[450px] w-full">
             {data.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                   <XAxis dataKey="timeStr" fontSize={11} minTickGap={30} />
                   <YAxis fontSize={11} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                   />
                   <Legend />
                   
                   {ALL_FIELDS.map((field) => (
                     selectedFields.includes(field.key) && (
                       <Line 
                         key={field.key}
                         type={field.type === 'number' ? 'monotone' : 'stepAfter'} 
                         dataKey={field.key} 
                         name={field.label} 
                         stroke={field.color} 
                         strokeWidth={2} 
                         dot={false}
                         activeDot={{ r: 4 }}
                       />
                     )
                   ))}
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded bg-slate-50/50">
                 <Search className="w-10 h-10 mb-2 opacity-20" />
                 <span>Belum ada data. Silakan pilih rentang waktu.</span>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* 3. TABEL RAW DATA (LENGKAP SEMUA KOLOM) */}
      {data.length > 0 && (
         <Card>
            <CardHeader>
               <CardTitle className="flex justify-between items-center">
                  <span>Raw Data Table</span>
                  <span className="text-xs font-normal text-gray-500">Showing last {data.length} records</span>
               </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-auto border rounded relative shadow-inner">
                 <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                       <tr>
                         <th className="p-3 font-bold border-b min-w-[100px]">Time</th>
                         {ALL_FIELDS.map(f => (
                           <th key={f.key} className="p-3 font-bold border-b min-w-[80px]" style={{ color: f.color }}>{f.label}</th>
                         ))}
                       </tr>
                    </thead>
                    <tbody>
                       {[...data].reverse().map((row, i) => (
                         <tr key={i} className="border-b hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors">
                            <td className="p-2 font-mono text-slate-500 border-r">{row.timeStr}</td>
                            
                            {ALL_FIELDS.map(field => {
                               const val = row[field.key]; // Ini nilai angka (0/1/2) hasil process
                               
                               let display = <span className="text-slate-700">{val}</span>;

                               // KITA BALIKIN TAMPILAN TABEL BIAR ENAK DIBACA (BUKAN ANGKA)
                               if (field.type === 'boolean') {
                                 display = val === 1 
                                   ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 mx-auto" title="ON"></span> 
                                   : <span className="inline-block w-2 h-2 rounded-full bg-slate-200 mx-auto" title="OFF"></span>;
                               } else if (field.type === 'enum') {
                                  if(val === 0) display = <span className="text-[10px] text-slate-400">Empty</span>;
                                  if(val === 1) display = <span className="text-[10px] text-blue-600 font-semibold">Occupied</span>;
                                  if(val === 2) display = <span className="text-[10px] text-purple-600 font-bold">Metal</span>;
                               } else {
                                  // Number / Float
                                  display = <span>{Number(val).toFixed(1)}</span>
                               }

                               return <td key={field.key} className="p-2 text-center border-r last:border-r-0 border-slate-100">{display}</td>
                            })}
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </CardContent>
         </Card>
      )}

    </div>
  );
}