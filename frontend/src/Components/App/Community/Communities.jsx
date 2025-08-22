import {
    Box,
    Container,
    Grid,
    Link,
    Skeleton,
    Typography,
    useTheme,
} from "@mui/material";
import PaginatedData from "../../Custom/PaginatedData/PaginatedData";
import Search from "../../Custom/Search/Search";
import { useEnhancedSearch } from "../../Hooks/useFuzzySearch";
import { Link as NavLink } from "react-router-dom";
import useResponsive from "../../Hooks/useResponsive";
import CardSkeleton from "../../Custom/List/Skeleton";

const Communities = () => {
    const theme = useTheme();

    const { isMobile } = useResponsive();

    const {
        searchResults,
        searchQuery,
        setSearchQuery,
        isLoading,
        allCommunities,
        hasSearched,
    } = useEnhancedSearch();

    if (isLoading) {
        return (
            <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 6 } }}>
                <Skeleton
                    variant="text"
                    width={300}
                    height={60}
                    sx={{ mx: "auto" }}
                />
                <Skeleton
                    variant="text"
                    width={400}
                    height={40}
                    sx={{ mx: "auto", mb: 4 }}
                />
                <Grid container spacing={4}>
                    {[...Array(isMobile ? 2 : 3)].map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <CardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
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
                    or{" "}
                    <Link component={NavLink} to="/create-a-community">
                        create your community
                    </Link>
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

export default Communities;
