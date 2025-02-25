import { FaPlus, FaRegCompass } from "react-icons/fa";
import { useReactRouter } from "../../Hooks/useReactRouter";

const NavMenu = () => {
    const { NavLink } = useReactRouter();

    const navMenuArray = [
        {
            name: "Create a community",
            link: "/create-a-community",
            icon: <FaPlus size={40} />,
        },
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

    return <ul className="navMenu">{navMenuOutput}</ul>;
};

export default NavMenu;
