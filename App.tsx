import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { extractTransactions } from './services/geminiService';
import { Transaction, FileStatus } from './types';
import { generateCSV, copyToClipboard } from './utils/csv';
import { Sparkles, Loader2, Copy, Download, RefreshCw, CheckCheck, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<FileStatus>(FileStatus.IDLE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const handleFilesSelect = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Only reset status if we are clearing files or starting fresh from a non-loading state
    if (status !== FileStatus.PROCESSING) {
      if (selectedFiles.length === 0) {
        setStatus(FileStatus.IDLE);
        setTransactions([]);
        setError(null);
        setProcessedCount(0);
      }
    }
  }, [status]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setStatus(FileStatus.PROCESSING);
    setProcessedCount(0);
    setError(null);
    setTransactions([]);

    try {
      // Process all files concurrently
      const promises = files.map(async (file) => {
        const base64Data = await convertFileToBase64(file);
        const result = await extractTransactions(base64Data, file.type);
        setProcessedCount((prev) => prev + 1);
        return result;
      });

      const results = await Promise.all(promises);
      
      // Flatten the array of arrays
      const allTransactions = results.flat();

      // Sort by date (ascending)
      allTransactions.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setTransactions(allTransactions);
      setStatus(FileStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze one or more documents. Please check the files and try again.");
      setStatus(FileStatus.ERROR);
    }
  };

  const handleCopyCSV = async () => {
    const csv = generateCSV(transactions);
    const success = await copyToClipboard(csv);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setTransactions([]);
    setStatus(FileStatus.IDLE);
    setError(null);
    setProcessedCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Statement Scanner [BANK Statement for Prasanna OCR]
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             {status === FileStatus.SUCCESS && (
                 <button 
                  onClick={handleReset}
                  className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center"
                 >
                   <RefreshCw className="w-4 h-4 mr-1" /> New Scan
                 </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        
        {/* Intro Section (only show if no results yet) */}
        {status === FileStatus.IDLE && files.length === 0 && (
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                    Turn Bank Statements into Spreadsheets
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload multiple pages of your bank statement, invoices, or receipts. 
                    We use Gemini 3.0 Pro AI to extract every transaction perfectly formatted for Google Sheets or Excel.
                </p>
            </div>
        )}

        {/* Upload Section */}
        {status !== FileStatus.SUCCESS && (
          <div className="flex flex-col items-center">
            <FileUpload 
              onFilesSelect={handleFilesSelect} 
              disabled={status === FileStatus.PROCESSING} 
            />
            
            {files.length > 0 && status !== FileStatus.PROCESSING && (
              <button
                onClick={handleAnalyze}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Analyze {files.length} Document{files.length !== 1 ? 's' : ''}
              </button>
            )}

            {status === FileStatus.PROCESSING && (
              <div className="flex flex-col items-center mt-4 p-8 bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Processing Documents...</h3>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 mb-4 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${files.length > 0 ? (processedCount / files.length) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full text-center divide-x divide-gray-100">
                    <div className="px-2">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total</p>
                        <p className="text-xl font-bold text-gray-800">{files.length}</p>
                    </div>
                    <div className="px-2">
                         <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Completed</p>
                         <p className="text-xl font-bold text-green-600">{processedCount}</p>
                    </div>
                    <div className="px-2">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Pending</p>
                        <p className="text-xl font-bold text-orange-500">{files.length - processedCount}</p>
                    </div>
                </div>
              </div>
            )}
            
            {status === FileStatus.ERROR && (
                <div className="mt-6 w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"/>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Extraction Failed</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button 
                            onClick={handleAnalyze}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 mt-2 underline"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {status === FileStatus.SUCCESS && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Extracted Transactions</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Combined data from {files.length} file{files.length !== 1 ? 's' : ''}. You can copy it directly to your clipboard.
                </p>
              </div>
              
              <div className="flex space-x-3">
                 <button
                  onClick={handleCopyCSV}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                    copied 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Data
                    </>
                  )}
                </button>
              </div>
            </div>

            <TransactionTable transactions={transactions} />

            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h3 className="text-lg font-medium text-indigo-900 mb-2">Next Steps</h3>
                <ol className="list-decimal list-inside text-indigo-800 space-y-2 text-sm">
                    <li>Click <strong>Copy Data</strong> above.</li>
                    <li>Open <strong>Google Sheets</strong> or <strong>Excel</strong>.</li>
                    <li>Select cell <strong>A1</strong> and paste (Ctrl+V or Cmd+V).</li>
                    <li>The data will automatically format into columns.</li>
                </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;