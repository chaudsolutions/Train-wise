import { Box, Grid, Pagination, Typography } from "@mui/material";
import { useMemo } from "react";
import CommunitiesList from "../List/CommunitiesList";
import SelectCategory from "../Buttons/SelectCategory";
import { useSearchParams } from "react-router-dom";

const PaginatedData = ({ communities }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const itemsPerPage = 21;

    // Get page from URL params or default to 1
    const page = parseInt(searchParams.get("page")) || 1;
    const categoryParam = searchParams.get("category") || "";

    // Apply category filter
    const filteredCommunities = useMemo(() => {
        if (!categoryParam) return communities;

        return communities?.filter((c) => c.category === categoryParam) || [];
    }, [communities, categoryParam]);

    // Calculate pagination data
    const { currentCommunities, pageCount } = useMemo(() => {
        if (!filteredCommunities?.length) {
            return { currentCommunities: [], pageCount: 0 };
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filteredCommunities.slice(startIndex, endIndex);
        const count = Math.ceil(filteredCommunities.length / itemsPerPage);

        return {
            currentCommunities: paginated,
            pageCount: count,
        };
    }, [filteredCommunities, page, itemsPerPage]);

    const handlePageChange = (event, value) => {
        setSearchParams({ page: value, category: categoryParam });
        window.scrollTo({ top: 100, behavior: "smooth" });
    };

    const selectCategory = (category) => {
        // Reset to page 1 when category changes
        setSearchParams({
            page: 1,
            category,
        });
    };

    return (
        <Box component="section">
            {/* select category buttons */}
            <SelectCategory
                activeCategory={categoryParam}
                selectCategory={selectCategory}
            />

            <Grid container spacing={4}>
                {currentCommunities.length > 0 ? (
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
                        color="primary"
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
