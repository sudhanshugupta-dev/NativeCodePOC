import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CLOUDINARY_UPLOAD_PRESET = 'metadata';
const CLOUDINARY_CLOUD_NAME = 'damww5riw';

export default function RegisterContainer() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
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
    data.append("public_id", userId);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });
    const json = await res.json();
    return json.secure_url;
  };

  const registerFace = async () => {
    if (!userId || !imageUri) {
      Alert.alert('Error', 'Please enter ID and capture an image');
      return;
    }

    try {
      const url = await uploadToCloudinary(imageUri);
     // await FaceAPI.addFace(url, userId);
      Alert.alert('Success', 'Face registered successfully');
      setImageUri(null);
      setUserId('');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to register face');
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
      <Button title="Capture Image" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="Register Face" onPress={registerFace} />
      
      <TouchableOpacity 
        style={styles.verifyButton} 
        onPress={() => router.push('/(verify)')}
      >
        <Text style={styles.verifyButtonText}>Go to Verify</Text>
      </TouchableOpacity>
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
});
