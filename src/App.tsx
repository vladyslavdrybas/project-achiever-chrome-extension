import React, {FormEvent, useEffect, useState} from 'react';
import {
    CssBaseline,
    ThemeProvider,
    Box,
    Avatar, IconButton, TextField, Button,
} from "@mui/material";
import { theme as themeLight } from '@/styles/theme/light';
import '@/styles/app.css';
import LocalStorage from "@/util/LocalStorage";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import browser from "webextension-polyfill";

function App() {
    const checkAuth = async () => {
        const storage = new LocalStorage();
        const hasAccessToken = !!(await storage.getAccessToken());
        const hasRefreshToken = !!(await storage.getRefreshToken());
        const hasLoggedUserId = !!(await storage.getLoggedUserId());

        return hasAccessToken && hasRefreshToken && hasLoggedUserId;
    }
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
    const [backgroundResponseMessage, setBackgroundResponseMessage] = useState<string>('');

    const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        console.log('handleLoginSubmit');
        setIsLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const email = data.get('email')?.toString() ?? '';
        const password = data.get('password')?.toString() ?? '';

        console.log({
            email,
            password,
        })

        if (email && password) {
            const response = await browser.runtime.sendMessage(
                {
                    from: 'content',
                    to: 'background',
                    action: 'authentication_email_password',
                    payload: {email, password}
                }
            )

            if (response.status === 200) {
                setIsAuth(true);
                setBackgroundResponseMessage('');
            } else {
                setBackgroundResponseMessage(response.message ?? '');
            }

        } else {

        }

        setIsLoading(false);
    }

    const handleLogoutSubmit = async (): Promise<void> => {
        console.log('handleLogoutSubmit');
        setIsLoading(true);

        const storage = new LocalStorage();
        await storage.log();

        setIsAuth(false);
        setIsLoading(false);
    }

    useEffect(() => {
        checkAuth().then(r => setIsAuth(r));
        setIsPageLoaded(true);
    }, [isPageLoaded]);

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
                    {!isPageLoaded ?
                        (
                            <IconButton
                                disabled={true}
                                size="large"
                                color="inherit"
                                sx={{
                                    m: 2,
                                    boxShadow: "0 1px 2px rgba(30,30,30,0.35)",
                                    transition: "box-shadow 0.3s ease-in-out",
                                }}
                            >
                                <HourglassBottomIcon />
                            </IconButton>
                        ) : (
                            <>
                                {!isAuth ?
                                    (
                                        <Box
                                            className="flex flex-column-centered"
                                            component="form"
                                            onSubmit={handleLoginSubmit}
                                            noValidate sx={{ mt: 1 }}

                                        >
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                id="email"
                                                label="Email Address"
                                                name="email"
                                                autoComplete="email"
                                                autoFocus
                                            />
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="password"
                                                label="Password"
                                                type="password"
                                                id="password"
                                                autoComplete="current-password"
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                disabled={isLoading}
                                                endIcon={!isLoading ? (<LoginIcon  sx={{color: "white"}}/>) : (<HourglassBottomIcon  sx={{color: "white"}}/>)}
                                            >
                                                Login
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={isLoading}
                                            endIcon={!isLoading ? (<LogoutIcon sx={{color: "white"}}/>) : (<HourglassBottomIcon  sx={{color: "white"}}/>)}
                                            onClick={handleLogoutSubmit}
                                            sx={{
                                                mt: 3,
                                            }}
                                        >
                                            Logout
                                        </Button>
                                    )
                                }
                            </>
                        )
                    }
                </Box>

                <Box
                    component="div"
                    id="response"
                >
                    {backgroundResponseMessage}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
