import { useReactRouter } from "../../Hooks/useReactRouter";
import "./list.css";

export const imgLink =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgSVMLJAybwkPi2a8EjrNSjQySErCvnOH1Kg&s";

export const logoLink =
    "https://png.pngtree.com/png-clipart/20190611/original/pngtree-wolf-logo-png-image_2306634.jpg";

const CommunitiesList = ({ community, index }) => {
    const { Link } = useReactRouter();

    return (
        <li className="communityLi">
            <Link to={`/community/${community.title}`}>
                <div className="cHead">
                    <div>#{index + 1}</div>
                    <img src={imgLink} alt="image" />
                </div>

                <div className="cBody">
                    <div>
                        <img src={logoLink} height={50} alt="logo" />
                        <h3>{community.title}</h3>
                    </div>
                    <p>{community.description.slice(0, 100)}...</p>

                    <div>
                        {community.members} Members • {community?.price}
                    </div>
                </div>
            </Link>
        </li>
    );
};

export default CommunitiesList;
