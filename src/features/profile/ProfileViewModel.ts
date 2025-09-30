import { useState } from 'react';
import { User } from './ProfileModel';

export const useProfileViewModel = () => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  });

  const [loading, setLoading] = useState(false);

  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(prev => ({ ...prev, ...userData }));
    setLoading(false);
    alert('Profile updated successfully!');
  };

  return {
    user,
    loading,
    updateProfile,
  };
};