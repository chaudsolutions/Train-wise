import { FaPlus, FaRegCompass } from "react-icons/fa";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import ButtonLoad from "../../Animations/ButtonLoad";

const NavMenu = () => {
    const { NavLink } = useReactRouter();

    const { userData, isUserDataLoading } = useUserData();

    const { role } = userData || {};

    const navMenuArray = [
        {
            name: "Discover communities",
            link: "/discovery",
            icon: <FaRegCompass size={40} />,
        },
    ];

    const navMenuOutput = navMenuArray.map((item, i) => (
        <li key={i}>
            <NavLink activeclassname="active" to={item.link}>
                {item.icon}
                <span>{item.name}</span>
            </NavLink>
        </li>
    ));

    return (
        <ul className="navMenu">
            {navMenuOutput}
            {isUserDataLoading ? (
                <ButtonLoad />
            ) : (
                <li>
                    {(role === "creator" || role === "admin" || !role) && (
                        <NavLink
                            activeclassname="active"
                            to="/create-a-community">
                            <FaPlus size={40} />
                            <span>Create a community</span>
                        </NavLink>
                    )}
                </li>
            )}
        </ul>
    );
};

export default NavMenu;
