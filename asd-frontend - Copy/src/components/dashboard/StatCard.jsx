import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = "text-clinical-blue", bgClass = "bg-blue-50" }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bgClass}`}>
        {Icon && <Icon className={`w-8 h-8 ${colorClass}`} />}
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;