import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Database, Loader2, Sparkles, FileVideo, FileText, FileJson } from 'lucide-react';
import VideoDropzone from '../components/upload/VideoDropzone';
import CSVDropzone from '../components/upload/CSVDropzone';
import JSONDropzone from '../components/upload/JSONDropzone';
import { uploadVideoForScreening, uploadCSVForScreening, uploadJSONForScreening } from '../api/analyzeApi';

const HomePage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('video'); // 'video', 'csv', or 'json'

  const handleScreening = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');

    try {
      let reportData;
      
      if (uploadMode === 'video') {
        console.log("🚀 Sending video to AI Engine...");
        reportData = await uploadVideoForScreening(file);
      } else if (uploadMode === 'csv') {
        console.log("🚀 Sending CSV to AI Engine...");
        reportData = await uploadCSVForScreening(file);
      } else if (uploadMode === 'json') {
        console.log("🚀 Sending JSON to AI Engine...");
        reportData = await uploadJSONForScreening(file);
      }
      
      // CRITICAL LOG: This proves Python sent data back
      console.log("✅ API Response Received:", reportData);
      
      if (!reportData) throw new Error("Backend returned empty data");

      console.log("➡️ Attempting Navigation to /report...");
      navigate('/report', { state: { report: reportData } });
      
    } catch (err) {
      console.error("❌ FULL ERROR OBJECT:", err);
      setError(err.message || 'Connection failed. Check if your FastAPI server is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeSwitch = (mode) => {
    setUploadMode(mode);
    setFile(null);
    setError('');
  };

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-50">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center mb-14 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 group hover:shadow-md transition-shadow">
            <div className="bg-blue-50 p-2 rounded-xl text-clinical-blue group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <span className="ml-3 pr-2 text-sm font-semibold text-slate-700 tracking-wide uppercase">AI Diagnostic Engine</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            <span className="text-slate-900">Neuromotor </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-clinical-blue to-indigo-600">
              Kinematic Screening
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Upload a patient video, CSV, or JSON file for automated, markerless spatial-temporal analysis. 
            Powered by extreme gradient boosting and 203 kinematic derivatives.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10 mb-10 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Initiate Assessment</h2>
              <p className="text-sm text-slate-500 mt-1">Patient data is processed ephemerally.</p>
            </div>
            <Sparkles className="w-6 h-6 text-slate-300" />
          </div>

          {/* Upload Mode Tabs */}
          <div className="mb-8 flex gap-2 bg-slate-100 p-1 rounded-lg w-full max-w-3xl mx-auto">
            <button
              onClick={() => handleModeSwitch('video')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all duration-200
                ${uploadMode === 'video'
                  ? 'bg-white text-clinical-blue shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              <FileVideo className="w-4 h-4" />
              Video
            </button>
            <button
              onClick={() => handleModeSwitch('csv')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all duration-200
                ${uploadMode === 'csv'
                  ? 'bg-white text-clinical-blue shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => handleModeSwitch('json')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all duration-200
                ${uploadMode === 'json'
                  ? 'bg-white text-clinical-blue shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
          </div>

          {/* Render appropriate dropzone */}
          {uploadMode === 'video' ? (
            <VideoDropzone onFileSelect={setFile} isLoading={isProcessing} />
          ) : uploadMode === 'csv' ? (
            <CSVDropzone onFileSelect={setFile} isLoading={isProcessing} />
          ) : (
            <JSONDropzone onFileSelect={setFile} isLoading={isProcessing} />
          )}

          <div className="mt-10 flex flex-col items-center">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 w-full max-w-2xl flex items-center">
                {error}
              </div>
            )}
            
            <button
              onClick={handleScreening}
              disabled={!file || isProcessing}
              className={`flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white transition-all duration-300 w-full max-w-sm
                ${!file || isProcessing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-clinical-blue to-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Analyzing...</>
              ) : 'Run AI Diagnostic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;