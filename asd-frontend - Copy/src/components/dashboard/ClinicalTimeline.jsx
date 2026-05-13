import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClinicalTimeline = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Risk Progression Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="timestamp" hide />
            <YAxis domain={[0, 1]} hide />
            
            {/* UPGRADED MODULAR TOOLTIP */}
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const point = payload[0].payload; // Extracts the current frame's data object
                  
                  return (
                    <div className="bg-slate-900 text-white p-4 rounded-xl text-xs shadow-xl min-w-[180px]">
                      {/* Overall Risk & Trigger */}
                      <p className="font-black text-sm mb-1 text-white">
                        {(point.overall_risk_score * 100).toFixed(0)}% Overall Risk
                      </p>
                      <p className="text-emerald-400 font-semibold mb-3">
                        {point.frame_trigger}
                      </p>
                      
                      {/* Live Regional Breakdown */}
                      <div className="border-t border-slate-700 pt-3 mt-2 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Upper Body:</span>
                          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                            {(point.regional_spikes.upper_body * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Lower Body:</span>
                          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                            {(point.regional_spikes.lower_body * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Symmetry:</span>
                          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                            {(point.regional_spikes.symmetry * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* UPDATED: dataKey is now overall_risk_score */}
            <Area 
              type="monotone" 
              dataKey="overall_risk_score" 
              stroke="#6366f1" 
              strokeWidth={3} 
              fillOpacity={0.1} 
              fill="#818cf8" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClinicalTimeline;