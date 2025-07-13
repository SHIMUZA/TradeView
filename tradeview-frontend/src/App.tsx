// src/App.tsx
import React, { useState, useEffect } from 'react';
import { SymbolForm } from './components/SymbolForm';
import { SymbolTable } from './components/SymbolTable';
import { MarketWatchService } from './services/marketWatchService';
import { useWebSocket } from './hooks/useWebSocket';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SymbolData {
  name: string;
  price: number | null;
  prevPrice: number | null;
}

export const App = () => {
  // Declaración correcta de los estados
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar símbolos iniciales
  useEffect(() => {
    const loadSymbols = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const symbolNames = await MarketWatchService.getAll();
    console.log('Símbolos recibidos en el componente:', symbolNames);
    
    if (symbolNames.length > 0) {
      setSymbols(
        symbolNames.map(name => ({
          name,
          price: null,
          prevPrice: null
        }))
      );
    }
  } catch (error) {
    console.error("Error loading symbols:", error);
    setError("Error al cargar símbolos");
  } finally {
    setLoading(false);
  }
};

    loadSymbols();
  }, []);

  // Configurar WebSocket
  useWebSocket(
    symbols.map((s) => s.name),
    (symbol, price) => {
      setSymbols((prev) =>
        prev.map((s) =>
          s.name === symbol
            ? { ...s, prevPrice: s.price, price }
            : s
        )
      );
    }
  );

  const handleAdd = async (symbol: string) => {
    try {
      await MarketWatchService.add(symbol);
      setSymbols(prev => [
        ...prev,
        { name: symbol, price: null, prevPrice: null }
      ]);
    } catch (error) {
      console.error("Error adding symbol:", error);
      throw error;
    }
  };

  const handleDelete = async (symbol: string) => {
    try {
      await MarketWatchService.delete(symbol);
      setSymbols(prev => prev.filter((s) => s.name !== symbol));
    } catch (error) {
      console.error("Error deleting symbol:", error);
      alert(`Failed to delete symbol: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Market Watch</h1>
      <SymbolForm onAddSymbol={handleAdd} />
      <SymbolTable symbols={symbols} onDelete={handleDelete} />
    </div>
  );
};