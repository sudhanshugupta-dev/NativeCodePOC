import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { styles } from './ProfileView.styles';

interface ProfileViewProps {
  user: any;
  loading: boolean;
  onUpdateProfile: (userData: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, loading, onUpdateProfile }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    onUpdateProfile({ name, email });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />
      
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <Button title="Save Profile" onPress={handleSave} variant="primary" />
      )}
      
      <Text style={styles.userInfo}>
        Current: {user.name} ({user.email})
      </Text>
    </ScrollView>
  );
};

export default ProfileView;