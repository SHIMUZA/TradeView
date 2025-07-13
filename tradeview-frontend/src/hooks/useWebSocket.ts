// src/hooks/useWebSocket.ts
import { useEffect } from 'react';

export const useWebSocket = (
  symbols: string[],
  onMessage: (symbol: string, price: number) => void
) => {
  useEffect(() => {
    if (symbols.length === 0) return;

    const sockets = symbols.map((symbol) => {
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
      );

      ws.onmessage = (event) => {
        const { s: symbol, p: price } = JSON.parse(event.data);
        onMessage(symbol, parseFloat(price));
      };

      return ws;
    });

    return () => {
      sockets.forEach((ws) => ws.close());
    };
  }, [symbols, onMessage]);
};