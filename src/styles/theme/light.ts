import { createTheme, PaletteOptions, ThemeOptions } from "@mui/material/styles";
import { common } from "@mui/material/colors";
import { TypographyOptions } from "@mui/material/styles/createTypography";
import { blueJeans } from "@/styles/colors";
import { spaceCadet } from "@/styles/colors";
import { rajah } from "@/styles/colors";
import { calPolyPomonaGreen } from "@/styles/colors";

const colorPrimary = spaceCadet;
const colorSecondary = rajah;

declare module '@mui/material/styles' {
    interface PaletteColor {
        gradientMain: string;
        gradientLight: string;
        gradientHeader: string;
    }

    interface SimplePaletteColorOptions {
        gradientMain?: string;
        gradientLight?: string;
        gradientHeader?: string;
    }
}

const typographyOptions: TypographyOptions = {
    h1: {
        fontSize: '5rem',
        fontFamily: 'greycliff-bold'
    },
    h2: {
        fontSize: '4rem',
        fontFamily: 'greycliff-bold'
    },
    h4: {
        fontSize: '2.5rem',
        fontFamily: 'greycliff-demibold'
    },
    h5: {
        fontSize: '2rem',
        fontFamily: 'greycliff-demibold'
    },
    h6: {
        fontSize: '1.2rem',
        fontFamily: 'greycliff-medium'
    },
    body1: {
        fontSize: '1.2rem',
        fontFamily: 'greycliff-regular',
        textAlign: 'justify',
    },
    body2: {
        fontSize: '2rem',
        fontFamily: 'greycliff-regular',
        textAlign: 'justify',
    }
}

const paletteOptions: PaletteOptions = {
    mode: "light",
    primary: {
        main: colorPrimary[900],
        light: colorPrimary[900],
        gradientMain: `linear-gradient(120deg, ${colorPrimary[200]} 0%, ${colorPrimary[400]} 50%,  ${colorPrimary[700]} 75%, ${colorPrimary[900]} 100%)`,
        gradientLight: `linear-gradient(90deg, ${colorPrimary[200]} 0%, ${colorPrimary[500]} 50%,  ${colorPrimary[700]} 75%, ${colorPrimary[900]} 100%)`,
        gradientHeader: `linear-gradient(144deg, ${colorPrimary[200]} 0%, ${colorPrimary[300]} 50%,  ${colorPrimary[500]} 85%, ${colorPrimary[800]} 100%)`,
    },
    secondary: {
        main: colorSecondary[300],
        gradientMain: `linear-gradient(120deg, ${colorSecondary[100]} 0%, ${colorSecondary[300]} 50%,  ${colorSecondary[400]} 75%, ${colorSecondary[800]} 100%)`,
        gradientLight: `linear-gradient(90deg, ${colorSecondary[200]} 0%, ${colorSecondary[500]} 50%,  ${colorSecondary[700]} 75%, ${colorSecondary[900]} 100%)`,
        gradientHeader: `linear-gradient(144deg, ${colorSecondary[200]} 0%, ${colorSecondary[300]} 50%,  ${colorSecondary[500]} 85%, ${colorSecondary[800]} 100%)`,
    },
    success: {
        main: calPolyPomonaGreen[700],
    },
    warning: {
        main: rajah[700],
    },
    info: {
        main: blueJeans[700],
    },
    background: {
        default: common.white,
    }
}

const options: ThemeOptions = {
    palette: paletteOptions,
    typography: typographyOptions,
};

let theme = createTheme(options);

theme = createTheme(theme,{
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                },
                containedPrimary: {
                    borderColor: theme.palette.primary.main,
                    transition: 'background 0.5s cubic-bezier(.29, 1.01, 1, -0.68)',
                    '&:hover': {
                        color: common.white,
                        background: theme.palette.primary.gradientLight,
                    },
                }
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                    transition: 'background 0.5s cubic-bezier(.29, 1.01, 1, -0.68)',
                    background: 'none',
                    marginLeft: 4,
                    marginRight: 4,
                    p: 0,
                    '&:hover': {
                        color: common.white,
                        background: theme.palette.secondary.main,
                        boxShadow: `rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset`,
                    },
                    '&:active': {
                        color: common.white,
                        background: theme.palette.secondary.main,
                        boxShadow: 'none',
                    },
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                    background: common.white,
                    boxShadow: `rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset`,
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                    background: common.white,
                    boxShadow: `rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset`,
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    boxShadow: `rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset`,
                    // background: theme.palette.secondary.gradientHeader,
                }
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    paddingBottom: 0,
                }
            }
        },
        MuiCardAction: {
            styleOverrides: {
                root: {
                    background: 'none',
                }
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                    paddingBottom: 8,
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: `rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset`,
                }
            }
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                    color: theme.palette.secondary.main,
                },
                colorPrimary: {
                    '&.Mui-checked': {
                        color: theme.palette.secondary.main,
                    },
                },
                colorSecondary: {
                    '&.Mui-checked': {
                        color: theme.palette.primary.main,
                    },
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    fontFamily: 'greycliff-demibold',
                    color: theme.palette.primary.main,
                    '&:hover': {
                        color: common.white,
                    },
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    '&.avatar-drop-shadow': {
                        filter: `drop-shadow(13px 21px 13px ${colorSecondary[900]})`,
                    },
                    '&.avatar-navigation-logo': {
                        width: 45,
                        height: 45,
                        bgcolor: 'none',
                        borderRadius: 0,
                    },
                },
            },
        },
    }
})

export { theme };
