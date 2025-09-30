import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Button from '../../components/Button';
import { styles } from './HomeView.styles';

interface HomeViewProps {
  data: any[];
  loading: boolean;
  error: string | null;
  onFetchData: () => void;
  onNavigateToSettings: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  data,
  loading,
  error,
  onFetchData,
  onNavigateToSettings,
}) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>MVVM Architecture Demo</Text>
      
      <Button 
        title={loading ? "Loading..." : "Fetch Data"} 
        onPress={onFetchData}
        disabled={loading}
        variant="primary"
      />
      
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      
      {data.length > 0 && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Fetched Data:</Text>
          {data.map((item) => (
            <Text key={item.id} style={styles.dataItem}>
              {item.name} (ID: {item.id})
            </Text>
          ))}
        </View>
      )}
      
      <Button 
        title="Go to Settings" 
        onPress={onNavigateToSettings}
        variant="outline"
      />
    </ScrollView>
  );
};

export default HomeView;