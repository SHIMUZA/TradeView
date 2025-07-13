// src/services/binanceService.ts
import axios from 'axios';

export const getPublicSymbols = async (): Promise<string[]> => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    return response.data.symbols.map((s: any) => s.symbol);
  } catch (error) {
    console.error('Error fetching Binance symbols:', error);
    return [];
  }
};