import { useReactRouter } from "../../Hooks/useReactRouter";
import "./footer.css";

const Footer = () => {
    const { NavLink } = useReactRouter();

    const footerLinks = [
        { name: "Contact Us", link: "/contact-us" },
        { name: "FAQs", link: "/frequently-asked-questions" },
        { name: "Privacy", link: "/privacy" },
        { name: "Pricing", link: "/pricing" },
    ];

    const output = footerLinks.map((link, i) => (
        <li key={i}>
            <NavLink to={link.link} activeclassname="active">
                {link.name}
            </NavLink>
        </li>
    ));

    return <ul className="footer">{output}</ul>;
};

export default Footer;
