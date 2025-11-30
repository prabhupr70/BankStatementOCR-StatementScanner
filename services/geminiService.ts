import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction } from "../types";

// Initialize Gemini Client
// API Key is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-3-pro-preview";

const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transactions: {
      type: Type.ARRAY,
      description: "List of extracted financial transactions",
      items: {
        type: Type.OBJECT,
        properties: {
          date: {
            type: Type.STRING,
            description: "Transaction date in YYYY-MM-DD format",
          },
          description: {
            type: Type.STRING,
            description: "Description or merchant name of the transaction",
          },
          category: {
            type: Type.STRING,
            description: "Category of the transaction (e.g., Groceries, Dining, Transport, Salary, Bills)",
          },
          amount: {
            type: Type.NUMBER,
            description: "Transaction amount. Positive for deposits/income, negative for expenses/withdrawals.",
          },
        },
        required: ["date", "description", "category", "amount"],
      },
    },
  },
  required: ["transactions"],
};

export const extractTransactions = async (
  base64Data: string,
  mimeType: string
): Promise<Transaction[]> => {
  try {
    const prompt = `
      Analyze this document and extract all financial transactions.
      
      Requirements:
      1. Extract Date (YYYY-MM-DD), Description, Category, and Amount.
      2. Amount must be POSITIVE for deposits/credits and NEGATIVE for expenses/debits.
      3. Auto-detect category based on the description (e.g., Groceries, Dining, Transport, Salary, Bills, Transfer, etc.).
      4. Skip header rows, total rows, balance carry-forward rows, and non-transaction text.
      5. If the year is missing, assume the current year or the most logical year based on the document context.
      6. Return ONLY the JSON object conforming to the schema.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
        // Increase token limit for long statements
        maxOutputTokens: 8192, 
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    const data = JSON.parse(responseText);
    return data.transactions || [];
  } catch (error) {
    console.error("Error extracting transactions:", error);
    throw error;
  }
};
