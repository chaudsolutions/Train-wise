import PaginatedData from "../../Custom/PaginatedData/PaginatedData";
import Search from "../../Custom/Search/Search";
import { generateCommunities } from "../../Hooks/useMockData";
import { useReactRouter } from "../../Hooks/useReactRouter";
import "./home.css";
import { useEffect } from "react";

const Home = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

    const { Link } = useReactRouter();

    const { communities } = generateCommunities();

    return (
        <main className="home">
            <header>
                <h1>Discover communities</h1>
                <p>
                    or <Link to="/create-a-community">create your own</Link>
                </p>
            </header>

            {/* search component */}
            <Search />

            {/* render data */}
            <PaginatedData communities={communities} />
        </main>
    );
};

export default Home;
