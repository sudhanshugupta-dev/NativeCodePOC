import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator 
} from 'react-native';
import { styles } from './Button.styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#007AFF' : 'white'} />
      ) : (
        <Text style={[
          styles.text,
          styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;