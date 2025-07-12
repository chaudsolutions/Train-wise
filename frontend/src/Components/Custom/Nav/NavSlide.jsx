import { Link } from "react-router-dom";
import Logout from "../Buttons/Logout";
import { useAuthContext } from "../../Context/AuthContext";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { noProfilePic } from "../../Hooks/useVariable";

export const AuthContainer = ({ setAuthOpen }) => {
    const { user } = useAuthContext();

    return (
        <>
            {user ? (
                <Logout />
            ) : (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setAuthOpen((prev) => !prev)}>
                    LOGIN
                </Button>
            )}
        </>
    );
};

export const UserProfile = () => {
    const { useLocation } = useReactRouter();
    const location = useLocation();

    const isProfilePage = location.pathname === "/profile";

    const { userData } = useUserData();

    const { name, role, avatar } = userData || {};

    return (
        <Box sx={{ p: 3, textAlign: "center" }}>
            <Avatar
                src={avatar || noProfilePic}
                sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    mx: "auto",
                }}>
                {!avatar && name?.charAt(0).toUpperCase()}
            </Avatar>

            {isProfilePage ? (
                <>
                    <Typography variant="h6" gutterBottom>
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        @{role}
                    </Typography>
                </>
            ) : (
                <Button
                    component={Link}
                    to="/profile"
                    endIcon={<ChevronRight />}
                    sx={{
                        textTransform: "none",
                        color: "text.primary",
                    }}>
                    My Profile
                </Button>
            )}
        </Box>
    );
};
