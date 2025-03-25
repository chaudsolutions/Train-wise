import { useReactRouter } from "../../Hooks/useReactRouter";
import "./list.css";

const CommunitiesList = ({ community }) => {
    const { Link } = useReactRouter();

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="community-card h-100">
                <Link
                    to={`/community/${community?._id}`}
                    className="text-decoration-none text-dark">
                    <div className="card-header position-relative">
                        <span className="position-absolute top-0 start-0 m-2 badge bg-white text-dark">
                            #{community?.SN}
                        </span>
                        <img
                            src={community?.bannerImage}
                            alt="Community banner"
                            className="card-img-top community-banner"
                        />
                    </div>
                    <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                            <img
                                src={community?.logo}
                                alt="Community logo"
                                className="rounded-circle me-3"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                }}
                            />
                            <h5 className="card-title mb-0">
                                {community?.name}
                            </h5>
                        </div>
                        <p className="card-text text-muted">
                            {community?.description?.slice(0, 100)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">
                                <i className="bi bi-people-fill me-1"></i>
                                {community?.members?.length || 0} Members
                            </span>
                            <span className="badge bg-primary">
                                {community?.subscriptionFee === 0
                                    ? "Free"
                                    : `$${community?.subscriptionFee}/mo`}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default CommunitiesList;
