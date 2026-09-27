import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, CheckCircle, XCircle } from 'lucide-react';

const BlockchainAudit: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.get('/blockchain/status').then(res => setStatus(res.data)).catch(console.error);
    api.get('/blockchain/transactions').then(res => setTransactions(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="text-blue-500" /> Blockchain Audit Ledger
        </h1>
        {status && (
          <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-semibold border border-slate-200">
            Mode: {status.mode} ({status.status})
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600">ID</th>
              <th className="p-4 font-semibold text-slate-600">Type</th>
              <th className="p-4 font-semibold text-slate-600">Entity</th>
              <th className="p-4 font-semibold text-slate-600">Hash</th>
              <th className="p-4 font-semibold text-slate-600">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.transaction_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm font-mono">{tx.transaction_id.substring(0, 12)}...</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                    {tx.transaction_type}
                  </span>
                </td>
                <td className="p-4 text-sm">{tx.entity_id}</td>
                <td className="p-4 text-sm font-mono text-slate-500">{tx.hash.substring(0, 16)}...</td>
                <td className="p-4 text-sm text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlockchainAudit;
