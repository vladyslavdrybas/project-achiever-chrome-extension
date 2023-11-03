import {FunctionComponent, PropsWithChildren, ReactNode, useEffect, useState} from "react";
import {
    Button,
    Box,
    Typography,
} from "@mui/material";

interface LoginFormProps extends PropsWithChildren {
    children?: ReactNode | undefined,
}

const LogoutForm: FunctionComponent<LoginFormProps> = ({
    children,
}) => {
    return (
        <Box
            component={"div"}
        >
            <Typography component="h1" variant="h5">
                Sign Out
            </Typography>
            <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                SignOut
            </Button>
        </Box>
    );
}

export default LogoutForm;