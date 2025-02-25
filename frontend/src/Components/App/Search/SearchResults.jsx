import { useEffect, useState } from "react";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { generateCommunities } from "../../Hooks/useMockData";
import PaginatedData from "../../Custom/PaginatedData/PaginatedData";
import "./searchResults.css";
import Search from "../../Custom/Search/Search";

const SearchResults = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

    const { communities } = generateCommunities();

    const { useLocation } = useReactRouter();

    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const query = queryParams.get("query");

    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        // find search query string in communities data
        const foundCommunities = communities?.filter((community) =>
            community?.title?.toLowerCase().includes(query.toLowerCase())
        );

        if (foundCommunities) {
            setSearchResults(foundCommunities);
        }
    }, [communities, query]);

    return (
        <main className="searchResults">
            <Search />
            <h3>Search Results for &quot;{query}&quot;</h3>
            <PaginatedData communities={searchResults} />
        </main>
    );
};

export default SearchResults;
