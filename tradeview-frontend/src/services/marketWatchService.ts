// src/services/marketWatchService.ts
import api from './api';
import { isAxiosError } from 'axios';

interface MarketWatchResponse {
  symbols?: string[];
  data?: {
    symbols?: string[];
  };
  [key: string]: any;
}

export const MarketWatchService = {

 getAll: async (): Promise<string[]> => {
  try {
    // 1. Hacer la petición sin tipado estricto
    const response = await api.get('/market-watch');
    console.log('Respuesta completa:', response);

    // 2. Extracción directa y "forzada" de los símbolos
    const responseData = response.data || {};
    let symbols: string[] = [];

    // Opción 1: Si los símbolos están en la propiedad 'symbols'
    if (Array.isArray(responseData.symbols)) {
      symbols = responseData.symbols;
    }
    // Opción 2: Si los símbolos están en el primer nivel (como array)
    else if (Array.isArray(responseData)) {
      symbols = responseData;
    }
    // Opción 3: Buscar en todas las propiedades del objeto
    else {
      // Recorrer todas las propiedades del objeto respuesta
      for (const key in responseData) {
        if (Array.isArray(responseData[key])) {
          symbols = responseData[key];
          break;
        }
      }
    }

    // 3. Validar y normalizar los símbolos
    if (symbols.length > 0) {
      return symbols.map(s => String(s).trim().toUpperCase());
    }

    console.warn('No se encontraron símbolos en:', responseData);
    return [];

  } catch (error) {
    console.error('Error en getAll:', error);
    return [];
  }
},


  add: async (symbol: string) => {
    try {
      const response = await api.post('/market-watch', { 
        Name: symbol.trim().toUpperCase() 
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
      throw new Error('Unknown error occurred');
    }
  },

  delete: async (symbol: string): Promise<void> => {
    try {
      const normalizedSymbol = symbol.trim().toUpperCase();
      await api.delete('/market-watch/${normalizedSymbol}');
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
      throw new Error('Unknown error occurred');
    }
  }
};