import React from 'react';
import { Transaction } from '../types';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
        <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
        <p>No transactions extracted yet.</p>
      </div>
    );
  }

  // Calculate statistics
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpending = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const transactionCount = transactions.length;

  return (
    <div className="space-y-6">
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Transactions Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{transactionCount}</p>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600 flex items-center">
              <span className="text-lg mr-0.5">+</span>
              {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Total Spending Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spending</p>
            <p className="text-2xl font-bold text-red-600 flex items-center">
              <span className="text-lg mr-0.5">-</span>
              {totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-indigo-50/30 transition-colors duration-150"
                >
                  <td className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap font-medium">
                    {t.date}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {t.description}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-right whitespace-nowrap">
                    <div className={`flex items-center justify-end font-semibold ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {t.amount >= 0 ? (
                        <ArrowUpCircle className="w-4 h-4 mr-1.5" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 mr-1.5" />
                      )}
                      {Math.abs(t.amount).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>{transactions.length} rows extracted</span>
          <span>Generated by Gemini 3.0 Pro</span>
        </div>
      </div>
    </div>
  );
};
