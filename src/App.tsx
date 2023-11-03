import React from 'react';
import {FunctionComponent, PropsWithChildren, ReactNode, useState, useMemo} from "react"

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
            sx={{
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                background: themeLight.palette.secondary.gradientMain
            }}
        >
            <Box
                component="header"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  justifyContent: "center",
                  alignItems: "center",
                  alignContent: "center",
                  p: 2,
                }}
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
              component="main"
              sx={{
                display: "flex",
                flexDirection: "column",
                flexWrap: "nowrap",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                p: 2,
              }}
            >
              <LoginForm></LoginForm>
            </Box>
        </Box>
    </ThemeProvider>
  );
}

export default App;
