import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CLOUDINARY_UPLOAD_PRESET = 'metadata';
const CLOUDINARY_CLOUD_NAME = 'damww5riw';

export default function RegisterContainer() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 👈 loader state

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      cameraType: 'front', // 👈 always open front camera
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadToCloudinary = async (uri: string) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: `${userId}.jpg`,
    } as any);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    data.append('public_id', userId);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
      }
    );
    const json = await res.json();
    return json.secure_url;
  };

  const registerFace = async () => {
    if (!userId || !imageUri) {
      Alert.alert('Error', 'Please enter ID and capture an image');
      return;
    }

    setLoading(true); // 👈 start loader
    try {
      const url = await uploadToCloudinary(imageUri);
      // await FaceAPI.addFace(url, userId);
      Alert.alert('Success', 'Face registered successfully');
      setImageUri(null);
      setUserId('');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to register face');
    } finally {
      setLoading(false); // 👈 stop loader
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Face</Text>

      <TextInput
        placeholder="Enter User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />

      <Button title="Capture Image" onPress={pickImage} disabled={loading} />

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Button
        title="Register Face"
        onPress={registerFace}
        disabled={loading || !imageUri}
      />

      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => router.push('/(verify)')}
        disabled={loading}
      >
        <Text style={styles.verifyButtonText}>Go to Verify</Text>
      </TouchableOpacity>

      {/* Loader Modal Overlay */}
      <Modal transparent visible={loading}>
        <View style={styles.overlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loaderText}>Uploading & Registering...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 8 },
  image: { width: 200, height: 200, marginVertical: 10, borderRadius: 10 },
  verifyButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  verifyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loaderText: { marginTop: 10, fontSize: 16, color: '#333' },
});
