import { Box, Grid, Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CommunitiesList from "../List/CommunitiesList";
import SelectCategory from "../Buttons/SelectCategory";

const PaginatedData = ({ communities }) => {
    const [filteredCommunities, setFilteredCommunities] = useState(communities);
    const [activeCategory, setActiveCategory] = useState("");
    const [currentCommunities, setCurrentCommunities] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const [page, setPage] = useState(1);
    const itemsPerPage = 21;

    useEffect(() => {
        setFilteredCommunities(communities);
    }, [communities]);

    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage;
        setCurrentCommunities(
            filteredCommunities?.slice(itemOffset, endOffset)
        );
        setPageCount(Math.ceil(filteredCommunities?.length / itemsPerPage));
    }, [filteredCommunities, itemOffset]);

    const handlePageChange = (event, value) => {
        setPage(value);
        const newOffset =
            ((value - 1) * itemsPerPage) % filteredCommunities.length;
        setItemOffset(newOffset);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const selectCategory = (category) => {
        setActiveCategory(category);
        setItemOffset(0);
        setPage(1);

        const filtered = category
            ? communities.filter((c) => c.category === category)
            : communities;

        setFilteredCommunities(filtered);
    };

    return (
        <Box component="section">
            {/* select category buttons */}
            <SelectCategory
                activeCategory={activeCategory}
                selectCategory={selectCategory}
            />

            <Grid container spacing={4}>
                {currentCommunities && currentCommunities.length > 0 ? (
                    currentCommunities?.map((community) => (
                        <CommunitiesList
                            key={community._id}
                            community={community}
                        />
                    ))
                ) : (
                    <Box sx={{ py: 5, width: "100%" }}>
                        <Typography
                            variant="h5"
                            textAlign="center"
                            color="text.secondary"
                            gutterBottom>
                            No communities created yet
                        </Typography>
                        <Typography
                            variant="body1"
                            textAlign="center"
                            color="text.secondary">
                            Be the first to create one!
                        </Typography>
                    </Box>
                )}
            </Grid>

            {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={handlePageChange}
                        color="info"
                        size="large"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                fontSize: "1rem",
                            },
                            "& .Mui-selected": {
                                fontWeight: "bold",
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default PaginatedData;
