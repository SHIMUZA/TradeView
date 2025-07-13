// src/components/SymbolTable/SymbolTable.tsx
import React, { useState } from 'react';
import { Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { SymbolData } from '../types/marketWatch';

interface SymbolTableProps {
  symbols: SymbolData[];
  onDelete: (symbol: string) => Promise<void>;
  emptyMessage?: string;
  isLoading?: boolean;
}

export const SymbolTable: React.FC<SymbolTableProps> = ({ 
  symbols, 
  onDelete,
  emptyMessage = "No hay símbolos en tu lista. Agrega tu primer símbolo.",
  isLoading = false
}) => {
  const [deletingSymbol, setDeletingSymbol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (symbol: string) => {
    try {
      setDeletingSymbol(symbol);
      setError(null);
      await onDelete(symbol);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el símbolo');
    } finally {
      setDeletingSymbol(null);
    }
  };

  const getPriceChange = (current: number | null, previous: number | null) => {
    if (current === null || previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="symbol-table-container">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
          <tr>
            <th>Símbolo</th>
            <th>Precio</th>
            <th>Variación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((symbol) => {
            const priceChange = getPriceChange(symbol.price, symbol.prevPrice);
            const isUp = priceChange !== null && priceChange > 0;
            const isDown = priceChange !== null && priceChange < 0;

            return (
              <tr
                key={symbol.name}
                style={{
                  backgroundColor:
                    symbol.price === symbol.prevPrice
                      ? '#f8f9fa'
                      : isUp
                      ? 'rgba(40, 167, 69, 0.1)'
                      : 'rgba(220, 53, 69, 0.1)',
                }}
              >
                <td className="fw-bold">{symbol.name}</td>
                <td>
                  {symbol.price !== null ? `$${symbol.price.toFixed(2)}` : '-'}
                </td>
                <td>
                  {priceChange !== null ? (
                    <Badge bg={isUp ? 'success' : isDown ? 'danger' : 'secondary'}>
                      {isUp ? '↑' : isDown ? '↓' : '→'} {Math.abs(priceChange).toFixed(2)}%
                    </Badge>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(symbol.name)}
                    disabled={deletingSymbol === symbol.name}
                  >
                    {deletingSymbol === symbol.name ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" />
                        <span className="visually-hidden">Eliminando...</span>
                      </>
                    ) : (
                      'Eliminar'
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default SymbolTable;