import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function DrawerIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(drawer)/home');
  }, [router]);
  return null;
}