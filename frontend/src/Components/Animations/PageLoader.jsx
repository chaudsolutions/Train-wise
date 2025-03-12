import "./pageLoader.css";

const PageLoader = () => {
    return (
        <div className="loader-container">
            <svg viewBox="25 25 50 50" className="svg">
                <circle r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    );
};

export default PageLoader;
