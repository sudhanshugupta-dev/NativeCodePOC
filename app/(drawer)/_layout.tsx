import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDrawerContent from '../../src/components/Drawer/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={CustomDrawerContent}>
        <Drawer.Screen 
          name="home" 
          options={{ 
            title: 'Home',
            headerShown: true 
          }} 
        />
        <Drawer.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            headerShown: true 
          }} 
        />
        <Drawer.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            headerShown: true 
          }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}