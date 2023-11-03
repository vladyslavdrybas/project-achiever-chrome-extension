import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Box,
  Avatar,
} from "@mui/material";
import { theme as themeLight } from '@/styles/theme/light';
import LoginForm from '@/components/LoginForm';
import '@/styles/app.css';

function App() {
  return (
    <ThemeProvider theme={themeLight}>
      <CssBaseline />
        <Box
            className="flex flex-column-centered"
            component="div"
            sx={{
                p: 2,
                background: themeLight.palette.secondary.gradientMain
            }}
        >
            <Box
                className="flex flex-column-centered"
                component="header"
            >
              <Avatar
                  className="avatar-drop-shadow"
                  src="/logo.svg"
                  alt="Motivator Logo"
                  sx={{
                    width: 144,
                    height: 144,
                    mt: 2,
                  }}
              />
            </Box>
            <Box
                className="flex flex-column-centered"
                component="main"
            >
              <LoginForm></LoginForm>
            </Box>
        </Box>
    </ThemeProvider>
  );
}

export default App;
