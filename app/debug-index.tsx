import { Link, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export default function DebugIndex() {
  const router = useRouter();

  const testNavigation = (route: string) => {
    try {
      console.log(`Attempting to navigate to: ${route}`);
      router.push(route as any);
    } catch (error) {
      console.error(`Navigation error for ${route}:`, error);
      Alert.alert('Navigation Error', `Failed to navigate to ${route}: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Debug Test</Text>
      <Text style={styles.subtitle}>Test route navigation:</Text>
      
      <View style={styles.linksContainer}>
        {/* Test with Link components */}
        <Link href="/(register)" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Register (Link)</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(verify)" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Verify (Link)</Text>
          </TouchableOpacity>
        </Link>

        {/* Test with programmatic navigation */}
        <TouchableOpacity 
          style={[styles.link, { backgroundColor: '#FF9500' }]}
          onPress={() => testNavigation('/(register)')}
        >
          <Text style={styles.linkText}>Register (Router.push)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.link, { backgroundColor: '#FF9500' }]}
          onPress={() => testNavigation('/(verify)')}
        >
          <Text style={styles.linkText}>Verify (Router.push)</Text>
        </TouchableOpacity>

        {/* Test other routes */}
        <Link href="/(drawer)" style={[styles.link, { backgroundColor: '#34C759' }]}>
          <Text style={styles.linkText}>Drawer Navigation</Text>
        </Link>

        <Link href="/(tabs)" style={[styles.link, { backgroundColor: '#34C759' }]}>
          <Text style={styles.linkText}>Tab Navigation</Text>
        </Link>
      </View>

      <Text style={styles.info}>
        Check console logs for navigation attempts
      </Text>
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
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  info: {
    marginTop: 30,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
