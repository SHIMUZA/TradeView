// src/components/SymbolForm/SymbolForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { getPublicSymbols } from '../services/binanceService';
import { AxiosError } from 'axios';

interface SymbolFormProps {
  onAddSymbol: (symbol: string) => Promise<void>;
  existingSymbols?: string[];
  emptyMessage?: string;
}

export const SymbolForm: React.FC<SymbolFormProps> = ({ 
  onAddSymbol, 
  existingSymbols = [], 
  emptyMessage = 'No symbols available' 
}) => {
  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showEmptyMessage, setShowEmptyMessage] = useState<boolean>(false);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const symbols = await getPublicSymbols();
        setOptions(symbols);
        setShowEmptyMessage(symbols.length === 0);
      } catch (error) {
        console.error('Error loading symbols:', error);
        setError('Failed to load available symbols');
        setShowEmptyMessage(true);
      }
    };

    fetchSymbols();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const symbol = input.trim().toUpperCase();
    
    if (!symbol) {
      setError('Please enter a symbol name');
      return;
    }

    if (existingSymbols.includes(symbol)) {
      setError(`Symbol ${symbol} already exists in your watchlist`);
      return;
    }

    try {
      setIsLoading(true);
      await onAddSymbol(symbol);
      setInput('');
    } catch (error) {
      let errorMessage = "Failed to add symbol";
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="symbol-form-container">
      <Form onSubmit={handleSubmit} className="mb-4">
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        {showEmptyMessage && (
          <Alert variant="info">
            {emptyMessage}
          </Alert>
        )}

        <div className="d-flex align-items-start">
          <Form.Group controlId="symbolInput" className="flex-grow-1">
            <Form.Control
              type="text"
              list="symbols-list"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError('');
              }}
              placeholder="Ej: BTCUSDT"
              required
              disabled={isLoading}
              isInvalid={!!error}
            />
            <datalist id="symbols-list">
              {options.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="ms-2"
            disabled={isLoading || !input.trim()}
            style={{ height: '38px' }} // Match input height
          >
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SymbolForm;