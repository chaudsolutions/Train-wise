import { Link } from "react-router-dom";
import { Button } from "@mui/material";

export const LinkOne = ({ linkDetails }) => {
    const { name, url } = linkDetails[0];

    return (
        <Button LinkComponent={Link} variant="contained" color="info" to={url}>
            {name}
        </Button>
    );
};

export const LinkTwo = ({ linkDetails }) => {
    const { name, url } = linkDetails[0];

    return (
        <Button LinkComponent={Link} variant="outlined" color="info" to={url}>
            {name}
        </Button>
    );
};
