import { IconButton, useTheme } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useNavigate } from "react-router-dom";

const GoBack = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <IconButton
            color="error"
            onClick={() => navigate(-1)}
            sx={{
                m: 2,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
            }}>
            <NavigateBeforeIcon />
        </IconButton>
    );
};

export default GoBack;
