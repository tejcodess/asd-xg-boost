import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    // UPDATED: Now looks for overall_risk_score
    const isHighRisk = dataPoint.overall_risk_score >= 0.5;

    return (
      <div className={`bg-white/95 border p-3 rounded-lg shadow-md max-w-xs ${isHighRisk ? 'border-red-500' : 'border-blue-500'}`}>
        <p className="m-0 font-bold text-slate-700">Time: {label}</p>
        <p className={`m-0 text-lg font-bold ${isHighRisk ? 'text-red-500' : 'text-blue-500'}`}>
          Risk Score: {(dataPoint.overall_risk_score * 100).toFixed(1)}%
        </p>
        <p className="m-0 mt-1 text-xs text-slate-500 leading-tight">
          {/* UPDATED: Now looks for frame_trigger */}
          <strong className="text-slate-700">Trigger:</strong> {dataPoint.frame_trigger}
        </p>
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const ResultsChart = ({ data, isASD }) => {
  if (!data || data.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-10">No kinematic timeline data available.</p>;
  }

  const themeColor = isASD ? '#ef4444' : '#3b82f6';

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
          
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={themeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            dy={10} 
          />
          
          <YAxis 
            domain={[0, 1]} 
            tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
          />
          
          <ReferenceLine 
            y={0.5} 
            stroke="#ef4444" 
            strokeDasharray="4 4" 
            label={{ position: 'top', value: 'Threshold (50%)', fill: '#ef4444', fontSize: 10 }} 
          />
          
          {/* UPDATED: dataKey is now overall_risk_score */}
          <Area 
            type="monotone"
            dataKey="overall_risk_score" 
            stroke={themeColor} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorRisk)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;