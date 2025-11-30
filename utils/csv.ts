import { Transaction } from '../types';

export const generateCSV = (transactions: Transaction[]): string => {
  if (!transactions || transactions.length === 0) return '';

  // Use tabs (\t) as delimiter. This ensures direct copy-paste compatibility 
  // with Google Sheets and Excel without needing "Split text to columns".
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  
  const rows = transactions.map((t) => {
    // Helper to clean data: remove tabs and newlines to prevent formatting breaks
    const clean = (str: string) => str.replace(/[\t\n\r]+/g, ' ').trim();
    
    return [
      t.date,
      clean(t.description),
      clean(t.category),
      t.amount.toString()
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};