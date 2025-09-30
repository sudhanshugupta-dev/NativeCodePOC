import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expo MVVM App!</Text>
      <Text style={styles.subtitle}>Choose your navigation style:</Text>
      
      <View style={styles.linksContainer}>
        <Link href="/(drawer)" style={styles.link}>
          Drawer Navigation
        </Link>
        <Link href="/(tabs)" style={styles.link}>
          Tab Navigation
        </Link>
        <Link href="/(home)" style={styles.link}>
          Stack Navigation
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  linksContainer: {
    gap: 15,
    width: '100%',
    maxWidth: 300,
  },
  link: {
    backgroundColor: '#007AFF',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});