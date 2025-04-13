import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { useLogout } from "../../Hooks/useLogout";
import { Button } from "@mui/material";

const Logout = () => {
    const { logout } = useLogout();
    const queryClient = useQueryClient(); // Get the query client

    const logOut = async () => {
        logout();
        queryClient.clear(); // Invalidate all queries
    };

    return (
        <Button variant="contained" color="info" onClick={logOut}>
            Log Out
        </Button>
    );
};

export default Logout;
