import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';

const CustomDrawerContent = (props: any) => {
  const router = useRouter();

  const menuItems = [
    { label: 'Home', route: '/(drawer)/home' },
    { label: 'Settings', route: '/(drawer)/settings' },
    { label: 'Profile', route: '/(drawer)/profile' },
  ];

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.container}>
        <Text style={styles.title}>Navigation</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
  },
});

export default CustomDrawerContent;