import { createTheme } from '@mui/material';
import type {} from '@mui/x-date-pickers/themeAugmentation';

const getTheme = (colorScheme: 'dark' | 'light') =>
  createTheme({
    typography: {
      button: {
        textTransform: 'none',
      },
    },
    palette: {
      mode: colorScheme,
    },
  });

export default getTheme;
