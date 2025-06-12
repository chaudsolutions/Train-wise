import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
    Box,
    Typography,
    Button,
    Skeleton,
    useTheme,
    IconButton,
    Grid,
    Link,
} from "@mui/material";
import { Link as NavLink } from "react-router-dom";
import { useRandomCommunitiesData } from "../../Hooks/useQueryFetch/useQueryData";
import CommunitiesList from "../List/CommunitiesList";
import useResponsive from "../../Hooks/useResponsive";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import CardSkeleton from "../List/Skeleton";

const CoursesSection = () => {
    const { randomCommunities, isRandomCommunitiesLoading } =
        useRandomCommunitiesData();
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const autoplayOptions = { delay: 5000, stopOnInteraction: true };
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "start", skipSnaps: false },
        [Autoplay(autoplayOptions)]
    );

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    // Skeleton loader for when data is loading
    if (isRandomCommunitiesLoading) {
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
                    {[...Array(isMobile ? 2 : 4)].map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <CardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                py: 8,
                px: { xs: 2, sm: 4, md: 6 },
                background: "linear-gradient(to bottom, #ffffff, #f9fbfd)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background:
                        "linear-gradient(120deg, rgba(25, 118, 210, 0.05) 0%, rgba(94, 53, 177, 0.05) 100%)",
                    zIndex: 0,
                },
            }}>
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    variant={isMobile ? "h4" : "h3"}
                    component="h2"
                    sx={{
                        fontWeight: 800,
                        textAlign: "center",
                        color: theme.palette.primary.dark,
                    }}>
                    Discover Vibrant Hubs
                </Typography>
                <Typography
                    variant="body1"
                    component="p"
                    color="textSecondary"
                    sx={{
                        fontWeight: 800,
                        textAlign: "center",
                        mb: 2,
                    }}>
                    or{" "}
                    <Link component={NavLink} to="/create-a-community">
                        Create Your Own
                    </Link>
                </Typography>

                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    component="p"
                    fontSize="1rem"
                    sx={{
                        fontWeight: 400,
                        textAlign: "center",
                        mb: 6,
                        maxWidth: 700,
                        mx: "auto",
                        color: theme.palette.text.secondary,
                    }}>
                    Explore these knowledge-sharing hubs where learners and
                    experts come together
                </Typography>

                {randomCommunities?.length > 0 ? (
                    <Box
                        sx={{
                            position: "relative",
                            mx: "auto",
                            maxWidth: "1400px",
                        }}>
                        {/* Navigation Arrows */}
                        <IconButton
                            onClick={scrollPrev}
                            sx={{
                                position: "absolute",
                                left: { xs: -10, sm: -20, md: -30 },
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 10,
                                background: "rgba(255,255,255,0.9)",
                                boxShadow: theme.shadows[4],
                                "&:hover": {
                                    background: theme.palette.primary.main,
                                    color: "white",
                                },
                                display: { xs: "none", sm: "flex" },
                            }}>
                            <ArrowBackIos />
                        </IconButton>

                        <IconButton
                            onClick={scrollNext}
                            color="primary"
                            sx={{
                                position: "absolute",
                                right: { xs: -10, sm: -20, md: -30 },
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 10,
                                background: "rgba(255,255,255,0.9)",
                                boxShadow: theme.shadows[4],
                                "&:hover": {
                                    background: theme.palette.primary.main,
                                    color: "white",
                                },
                                display: { xs: "none", sm: "flex" },
                            }}>
                            <ArrowForwardIos />
                        </IconButton>

                        {/* Embla Carousel Container */}
                        <Box
                            className="embla"
                            ref={emblaRef}
                            sx={{
                                overflow: "hidden",
                                padding: "10px",
                            }}>
                            <Box
                                className="embla__container"
                                sx={{
                                    display: "flex",
                                    gap: { xs: 2, sm: 3, md: 4 },
                                }}>
                                {randomCommunities.map((community) => (
                                    <Box
                                        className="embla__slide"
                                        key={community._id}
                                        sx={{
                                            flex: "0 0 auto",
                                            minWidth: 0,
                                            width: {
                                                xs: "100%",
                                                md: "calc(35% - 32px)",
                                            },
                                            position: "relative",
                                        }}>
                                        <CommunitiesList
                                            community={community}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Typography
                        variant="h6"
                        color="textSecondary"
                        align="center"
                        sx={{ py: 4 }}>
                        No communities found
                    </Typography>
                )}

                <Box sx={{ textAlign: "center", mt: 6 }}>
                    <Button
                        component={NavLink}
                        to="/communities"
                        variant="outlined"
                        size="large"
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: "1rem",
                            fontWeight: 700,
                            borderRadius: "50px",
                            borderWidth: 2,
                            "&:hover": {
                                borderWidth: 2,
                                backgroundColor: theme.palette.primary.main,
                                color: "white",
                            },
                        }}>
                        Explore Learning Hubs
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CoursesSection;
