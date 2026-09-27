import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.get('/security/risk-summary').then(res => setSummary(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShieldAlert className="text-blue-500" /> Security Overview
      </h1>
      
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col">
            <span className="text-gray-500 text-sm font-semibold uppercase">Risk Score</span>
            <span className={`text-4xl font-bold mt-2 ${summary.overall_risk_score > 70 ? 'text-red-500' : 'text-green-500'}`}>
              {summary.overall_risk_score}/100
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col">
            <span className="text-gray-500 text-sm font-semibold uppercase">Active Critical</span>
            <span className="text-4xl font-bold mt-2 text-red-500">{summary.critical_active_incidents}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col">
            <span className="text-gray-500 text-sm font-semibold uppercase">Compromised Devices</span>
            <span className="text-4xl font-bold mt-2 text-orange-500">{summary.compromised_devices}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col">
            <span className="text-gray-500 text-sm font-semibold uppercase">Status</span>
            <span className={`text-2xl font-bold mt-4 ${summary.status === 'DANGER' ? 'text-red-500' : 'text-green-500'}`}>
              {summary.status}
            </span>
          </div>
        </div>
      )}

      {/* Add more events table here later */}
    </div>
  );
};

export default SecurityDashboard;
