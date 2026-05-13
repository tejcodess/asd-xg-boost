import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 20, text = "Loading...", className = "" }) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 size={size} className="animate-spin text-clinical-blue" />
      {text && <span className="font-medium text-slate-600">{text}</span>}
    </div>
  );
};

export default Spinner;