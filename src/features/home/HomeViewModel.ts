import { useState } from 'react';
import { HomeState, HomeData } from './HomeModel';

export const useHomeViewModel = () => {
  const [state, setState] = useState<HomeState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: HomeData[] = [
        { id: 1, name: 'Sample Item 1', description: 'This is a sample item' },
        { id: 2, name: 'Sample Item 2', description: 'Another sample item' },
        { id: 3, name: 'Sample Item 3', description: 'Third sample item' },
      ];
      
      setState(prev => ({ ...prev, data: mockData, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch data', 
        loading: false 
      }));
    }
  };

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fetchData,
  };
};