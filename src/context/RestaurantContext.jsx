import { createContext, useContext, useState, useEffect } from 'react';
import { getRestaurant } from '../services/db';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRestaurant();
      setRestaurant(data);
    } catch (err) {
      console.error('Failed to load restaurant:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = (data) => {
    setRestaurant(data);
  };

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, error, updateRestaurant, loadRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
}

