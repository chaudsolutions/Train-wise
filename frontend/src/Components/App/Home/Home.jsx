import { Box, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageLoader from "../../Animations/PageLoader";
import PaginatedData from "../../Custom/PaginatedData/PaginatedData";
import Search from "../../Custom/Search/Search";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { useEnhancedSearch } from "../../Hooks/useFuzzySearch";

const Home = () => {
    const { Link } = useReactRouter();
    const theme = useTheme();

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
            <Box component="header" sx={{ mb: 4, textAlign: "center" }}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                    }}>
                    Discover communities
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    or <Link to="/create-a-community">create your own</Link>
                </Typography>
            </Box>

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

export default Home;
