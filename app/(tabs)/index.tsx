import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/settings');
  }, [router]);
  return null;
}