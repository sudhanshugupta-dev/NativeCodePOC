import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { styles } from './Loader.styles';

interface LoaderProps {
  size?: 'small' | 'large';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'large', 
  text = 'Loading...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#007AFF" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Loader;