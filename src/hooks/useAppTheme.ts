import { useColorScheme } from 'react-native';
import { Colors } from '../theme/Colors';

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const theme = {
    colors: {
      ...Colors,
      background: {
        primary: isDark ? Colors.gray[900] : Colors.white,
        secondary: isDark ? Colors.gray[800] : Colors.gray[100],
      },
      text: {
        primary: isDark ? Colors.white : Colors.black,
        secondary: isDark ? Colors.gray[300] : Colors.gray[600],
      },
    },
    isDark,
  };
  
  return theme;
};