import { useState } from "react";
import "./search.css";
import { IoSearchOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { generateCommunities } from "../../Hooks/useMockData";
import { useReactRouter } from "../../Hooks/useReactRouter";

const Search = () => {
    // get all communities data
    const { communities } = generateCommunities();

    const { useNavigate } = useReactRouter();

    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim() === "") {
            return toast.error("Search field cannot be empty");
        }

        // find search query string in communities data
        const foundCommunities = communities?.filter((community) =>
            community?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (foundCommunities.length === 0) {
            return toast.error("No communities found matching your search");
        }

        navigate(`/search?query=${searchQuery}`);
    };

    return (
        <div className="searchComponent">
            <IoSearchOutline size={25} onClick={handleSearch} />
            <input
                type="search"
                name="search"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for anything"
            />
        </div>
    );
};

export default Search;
