import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
  dataContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dataTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataItem: {
    marginBottom: 5,
  },
});