import ReactPaginate from "react-paginate";
import CommunitiesList from "../List/CommunitiesList";
import { useEffect, useState } from "react";
import { categories } from "../../Hooks/useVariable";
import "./paginated.css";

const PaginatedData = ({ communities }) => {
    // State for filtered communities (starts as full list)
    const [filteredCommunities, setFilteredCommunities] = useState(communities);
    const [activeCategory, setActiveCategory] = useState("");

    // State for currently displayed (paginated) communities
    const [currentCommunities, setCurrentCommunities] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);

    // Pagination: number of items per page
    const itemsPerPage = 21;

    // Update local state when communities prop changes
    useEffect(() => {
        setFilteredCommunities(communities);
    }, [communities]);

    // Update pagination whenever the filtered communities or offset changes
    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage;
        setCurrentCommunities(
            filteredCommunities?.slice(itemOffset, endOffset)
        );
        setPageCount(Math.ceil(filteredCommunities?.length / itemsPerPage));
    }, [filteredCommunities, itemOffset]);

    // Handle page change from ReactPaginate
    const handlePageClick = (event) => {
        // Calculate new offset based on the filtered list's length
        const newOffset =
            (event.selected * itemsPerPage) % filteredCommunities.length;
        setItemOffset(newOffset);
    };

    // Filter communities by category and reset pagination offset
    const selectCategory = (category) => {
        setActiveCategory(category);
        setItemOffset(0); // reset to the first page when filtering

        const filtered = category
            ? communities.filter((c) => c.category === category)
            : communities;

        setFilteredCommunities(filtered);
    };

    // Map the current (paginated) communities to list items
    const communitiesList = currentCommunities?.map((community, i) => (
        <CommunitiesList key={i} community={community} index={i} />
    ));

    return (
        <section className="paginated">
            <ul className="categories">
                <li>
                    <button
                        onClick={() => selectCategory("")}
                        className={
                            activeCategory === "" ? "activeCategory" : ""
                        }>
                        <span>All</span>
                    </button>
                </li>
                {categories.map((category, i) => (
                    <li key={i}>
                        <button
                            className={
                                activeCategory === category.name
                                    ? "activeCategory"
                                    : ""
                            }
                            onClick={() => selectCategory(category.name)}>
                            {category.icon} <span>{category.name}</span>
                        </button>
                    </li>
                ))}
            </ul>

            {/* communities list */}
            <ul className="communitiesUl">{communitiesList}</ul>

            <ReactPaginate
                breakLabel="..."
                nextLabel="Next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={0}
                marginPagesDisplayed={0}
                pageCount={pageCount}
                previousLabel="< Previous"
                renderOnZeroPageCount={null}
                containerClassName="pagination"
                pageLinkClassName="page-num"
                previousLinkClassName="page-num page-link"
                nextLinkClassName="page-num page-link"
                activeClassName="active"
            />
        </section>
    );
};

export default PaginatedData;
