import { Link } from "react-router-dom";
import "./buttons.css";

export const LinkOne = ({ linkDetails }) => {
    const { name, url } = linkDetails[0];

    return (
        <Link to={url} className="linkOne">
            {name}
        </Link>
    );
};

export const LinkTwo = ({ linkDetails }) => {
    const { name, url } = linkDetails[0];

    return (
        <Link to={url} className="linkTwo">
            {name}
        </Link>
    );
};
