// src/pages/ReportPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, CheckCircle2, Activity, Code, ClipboardList, Download, ActivitySquare } from 'lucide-react';
import ClinicalTimeline from '../components/dashboard/ClinicalTimeline';

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showRaw, setShowRaw] = useState(false);

  const report = location.state?.report;

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">No Analysis Session Active</h2>
        <p className="text-slate-500 mb-6 max-w-xs">Please upload a video to generate a kinematic report.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Return to Assessment
        </button>
      </div>
    );
  }

  // Safely extract the new nested JSON structure
  const { 
    diagnosis, 
    severity_level, 
    overall_confidence, 
    narrative 
  } = report.clinical_summary;
  
  const regions = report.regional_breakdown;
  const isASD = diagnosis === 'Autism Spectrum Disorder';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      <div className="max-w-6xl mx-auto px-6 pt-10 print:pt-0">
        
        {/* Navigation & Controls */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Assessment
          </button>
          
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-shadow shadow-md"
          >
            <Download className="w-4 h-4" /> Save Report as PDF
          </button>
        </div>

        {/* PDF Header (Only visible when printing) */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-900">Clinical Kinematic Screening Report</h2>
          <p className="text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Diagnostic Card */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 print:shadow-none print:border-slate-300 print:rounded-2xl">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kinematic Analysis</h1>
                <p className="text-slate-400 mt-2 font-medium">Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-50 px-6 py-3 rounded-2xl text-center print:border print:border-blue-200">
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-wider">AI Confidence</p>
                  <p className="text-3xl font-black text-blue-700">{overall_confidence}</p>
                </div>
                
                {/* Dynamically changes color based on Mild, Moderate, or Severe */}
                {isASD && (
                  <div className={`px-6 py-3 rounded-2xl text-center print:border ${
                    severity_level === 'Mild' ? 'bg-yellow-50 text-yellow-700 print:border-yellow-200' : 
                    severity_level === 'Moderate' ? 'bg-orange-50 text-orange-700 print:border-orange-200' : 
                    'bg-red-50 text-red-700 print:border-red-200'
                  }`}>
                    <p className="font-bold text-xs uppercase tracking-wider opacity-80">Severity</p>
                    <p className="text-3xl font-black">{severity_level}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Classification Highlight */}
            <div className={`flex items-center gap-6 p-8 rounded-[2rem] text-white mb-10 transition-all print:border-2 ${isASD ? 'bg-slate-900 print:border-slate-800 print:text-slate-900' : 'bg-slate-800 print:border-slate-400 print:text-slate-800'}`}>
              <div className={`p-4 rounded-2xl ${isASD ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                {isASD ? <Activity className={`w-10 h-10 ${isASD ? 'text-red-400 print:text-red-600' : ''}`} /> : <CheckCircle2 className="w-10 h-10 text-emerald-400 print:text-emerald-600" />}
              </div>
              <div>
                <p className="text-slate-400 print:text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Diagnostic Classification</p>
                <h2 className="text-3xl font-black italic tracking-tight">
                  {isASD ? "Atypical Kinematics Found" : "Neurotypical Baseline"}
                </h2>
              </div>
            </div>

            {/* NEW: Regional Breakdown Section */}
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <ActivitySquare className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold">Regional Kinematic Breakdown</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Object.entries(regions).map(([regionKey, data]) => {
                const isElevated = data.risk_status === "Elevated";
                const formatName = (key) => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                return (
                  <div key={regionKey} className={`p-5 rounded-2xl border ${isElevated ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'} print:bg-white`}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700 text-sm">{formatName(regionKey)}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${isElevated ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                        {data.risk_status}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {data.markers.map((marker, i) => (
                        <li key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isElevated ? 'bg-red-400' : 'bg-slate-300'}`} /> 
                          {marker}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar: Observations & Raw Output */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col print:shadow-none print:border-slate-300 print:rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">AI Observations</h3>
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-800 leading-relaxed italic mb-8 relative print:bg-white print:border-blue-200">
              <span className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase">Automated Summary</span>
              "{narrative}"
            </div>

            {/* Video Player (If URL is available) */}
            {report.video_url && (
              <div className="mb-6 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-900">
                <video src={report.video_url} controls className="w-full h-auto" />
              </div>
            )}

            <div className="space-y-3 mt-auto print:hidden">
              <button 
                onClick={() => setShowRaw(!showRaw)} 
                className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Code className="w-5 h-5" /> {showRaw ? "Hide AI Data" : "Inspect Raw Tensors"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Risk Timeline */}
        {report.analysis_timeline && (
          <div className="mb-8 print:break-inside-avoid">
            <ClinicalTimeline data={report.analysis_timeline} />
          </div>
        )}

        {/* Raw JSON Debugging Panel */}
        {showRaw && (
          <div className="print:hidden bg-slate-900 rounded-[2rem] p-8 overflow-x-auto shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-emerald-400 font-mono text-xs uppercase tracking-widest">Inference Response JSON</h4>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
             </div>
            <pre className="text-emerald-500/80 font-mono text-[10px] leading-relaxed">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;