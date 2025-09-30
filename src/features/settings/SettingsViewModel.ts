import { useState } from 'react';
import { Settings } from './SettingsModel';

export const useSettingsViewModel = () => {
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    darkMode: false,
    autoSync: true,
  });

  const toggleSetting = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveSettings = async () => {
    console.log('Saving settings:', settings);
    await new Promise(resolve => setTimeout(resolve, 500));
    alert('Settings saved successfully!');
  };

  return {
    settings,
    toggleSetting,
    saveSettings,
  };
};