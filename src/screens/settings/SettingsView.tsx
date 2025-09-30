import React from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import Button from '../../components/Button';
import { styles } from './SettingsView.styles';

interface SettingsViewProps {
  settings: any;
  onToggleSetting: (key: string) => void;
  onSaveSettings: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onToggleSetting,
  onSaveSettings,
}) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingItem}>
        <Text>Push Notifications</Text>
        <Switch
          value={settings.pushNotifications}
          onValueChange={() => onToggleSetting('pushNotifications')}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text>Dark Mode</Text>
        <Switch
          value={settings.darkMode}
          onValueChange={() => onToggleSetting('darkMode')}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text>Auto Sync</Text>
        <Switch
          value={settings.autoSync}
          onValueChange={() => onToggleSetting('autoSync')}
        />
      </View>
      
      <Button title="Save Settings" onPress={onSaveSettings} variant="primary" />
    </ScrollView>
  );
};

export default SettingsView;