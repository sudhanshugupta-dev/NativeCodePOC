import React from 'react';
import ProfileView from './ProfileView';
import { useProfileViewModel } from '../../features/profile/ProfileViewModel';

const ProfileContainer = () => {
  const viewModel = useProfileViewModel();

  return (
    <ProfileView
      user={viewModel.user}
      loading={viewModel.loading}
      onUpdateProfile={viewModel.updateProfile}
    />
  );
};

export default ProfileContainer;