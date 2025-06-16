import { IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

const GoBack = () => {
    const navigate = useNavigate();

    return (
        <IconButton color="error" size="large" onClick={() => navigate(-1)}>
            <ArrowBackIosIcon />
        </IconButton>
    );
};

export default GoBack;
