
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FaceAPI from '../../native_modules/FaceAPI';

const CLOUDINARY_CLOUD_NAME = 'damww5riw';

export default function VerifyContainer() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [storedImageUri, setStoredImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch stored Cloudinary image when userId changes
  useEffect(() => {
    if (!userId) {
      setStoredImageUri(null);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${userId}.jpg`;
      try {
        // Simple fetch to check if image exists
        console.log("url", url);

        const res = await fetch(url);
        console.log("Response", res)
        if (res.ok) setStoredImageUri(url);
        else setStoredImageUri(null);
      } catch (e) {
        console.error(e);
        setStoredImageUri(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [userId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setCapturedUri(result.assets[0].uri);
  };

  const verifyFace = async () => {
    if (!userId || !capturedUri || !storedImageUri) {
      Alert.alert('Error', 'Please enter a valid ID and capture an image');
      return;
    }
     console.log("we are  here", storedImageUri, capturedUri)
    try {
      const result = await FaceAPI.compare(storedImageUri, capturedUri);
      Alert.alert(
        'Result',
        result.match
          ? `✅ Face matched! Score: ${result.score.toFixed(2)}`
          : `❌ Not matched. Score: ${result.score.toFixed(2)}`
      );
      setCapturedUri(null);
      setUserId('');
      setStoredImageUri(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to verify face');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Face</Text>
      <TextInput
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 10 }} />}

      {storedImageUri && !loading && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Text>Stored Face:</Text>
          <Image source={{ uri: storedImageUri }} style={styles.image} />
        </View>
      )}

      <Button title="Capture Image" onPress={pickImage} />
      {capturedUri && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Text>Captured Image:</Text>
          <Image source={{ uri: capturedUri }} style={styles.image} />
        </View>
      )}

      <Button title="Verify Face" onPress={verifyFace} disabled={loading || !storedImageUri} />
      
      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={() => router.push('/(register)')}
      >
        <Text style={styles.registerButtonText}>New User? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 8 },
  image: { width: 200, height: 200, borderRadius: 10, marginVertical: 10 },
  registerButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  registerButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
