import React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';
import { styles } from './TextInput.styles';

interface CustomTextInputProps extends TextInputProps {
  error?: boolean;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  error = false,
  style,
  ...props
}) => {
  return (
    <RNTextInput
      style={[
        styles.input,
        error && styles.error,
        style,
      ]}
      placeholderTextColor="#999"
      {...props}
    />
  );
};

export default TextInput;