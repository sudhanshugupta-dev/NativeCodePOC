import React from 'react';
import SettingsView from './SettingsView';
import { useSettingsViewModel } from '../../features/settings/SettingsViewModel';

const SettingsContainer = () => {
  const viewModel = useSettingsViewModel();

  return (
    <SettingsView
      settings={viewModel.settings}
      onToggleSetting={viewModel.toggleSetting}
      onSaveSettings={viewModel.saveSettings}
    />
  );
};

export default SettingsContainer;