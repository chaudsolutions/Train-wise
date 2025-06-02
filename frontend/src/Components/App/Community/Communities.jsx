import { Box, Container, Typography } from "@mui/material";
import PageLoader from "../../Animations/PageLoader";
import PaginatedData from "../../Custom/PaginatedData/PaginatedData";
import Search from "../../Custom/Search/Search";
import { useEnhancedSearch } from "../../Hooks/useFuzzySearch";

const Communities = () => {
    const {
        searchResults,
        searchQuery,
        setSearchQuery,
        isLoading,
        allCommunities,
        hasSearched,
    } = useEnhancedSearch();

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* search component */}
            <Box sx={{ mb: 4 }}>
                <Search
                    setSearchQuery={setSearchQuery}
                    searchQuery={searchQuery}
                />

                {hasSearched && (
                    <Typography
                        component="p"
                        variant="body2"
                        textAlign="center"
                        sx={{ mt: 1, color: "text.secondary" }}>
                        Found {searchResults.length}{" "}
                        {searchResults.length === 1 ? "result" : "results"}
                    </Typography>
                )}
            </Box>

            {/* render data */}
            <PaginatedData
                communities={searchQuery ? searchResults : allCommunities}
            />
        </Container>
    );
};

export default Communities;
