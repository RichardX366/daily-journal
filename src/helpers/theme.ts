import { createTheme } from '@mui/material';
import type {} from '@mui/x-date-pickers/themeAugmentation';

const getTheme = (darkMode: boolean) =>
  createTheme({
    typography: {
      button: {
        textTransform: 'none',
      },
    },
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

export default getTheme;
