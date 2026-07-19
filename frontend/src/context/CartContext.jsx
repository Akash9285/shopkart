import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });

  const refreshCart = useCallback(async () => {
    const { data } = await api.get('/cart');
    setCart(data);
  }, []);

  const addToCart = async (productId, size, color, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, size, color, quantity });
    setCart(data);
  };

  const updateQuantity = async (itemIndex, quantity) => {
    const { data } = await api.put(`/cart/${itemIndex}`, { quantity });
    setCart(data);
  };

  const removeItem = async (itemIndex) => {
    const { data } = await api.delete(`/cart/${itemIndex}`);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, refreshCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
