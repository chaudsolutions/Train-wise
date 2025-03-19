import { useReactRouter } from "../../Hooks/useReactRouter";
import "./list.css";

export const imgLink =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgSVMLJAybwkPi2a8EjrNSjQySErCvnOH1Kg&s";

export const logoLink =
    "https://png.pngtree.com/png-clipart/20190611/original/pngtree-wolf-logo-png-image_2306634.jpg";

const CommunitiesList = ({ community }) => {
    const { Link } = useReactRouter();

    return (
        <li className="communityLi">
            <Link to={`/community/${community?._id}`}>
                <div className="cHead">
                    <div>#{community?.SN}</div>
                    <img src={community?.bannerImage} alt="image" />
                </div>

                <div className="cBody">
                    <div>
                        <img src={community?.logo} alt="logo" />
                        <h3>{community?.name}</h3>
                    </div>
                    <p>{community?.description.slice(0, 100)}...</p>

                    <div>
                        {community?.members?.length || 0} Members •{" "}
                        {community?.subscriptionFee &&
                        community?.subscriptionFee === 0
                            ? "Free"
                            : `$${community?.subscriptionFee}/Month`}
                    </div>
                </div>
            </Link>
        </li>
    );
};

export default CommunitiesList;
