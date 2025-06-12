import {
    CircularProgress,
    styled,
    Tab,
    Tabs,
    Typography,
    useTheme,
} from "@mui/material";
import { useCategoriesData } from "../../Hooks/useQueryFetch/useQueryData";
import useResponsive from "../../Hooks/useResponsive";

const EmojiContainer = styled("span")(({ theme }) => ({
    fontSize: "1.2rem",
    lineHeight: 1,
    display: "inline-flex",
    marginRight: theme.spacing(1),
    fontFamily:
        '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif',
}));

const SelectCategory = ({ activeCategory, selectCategory }) => {
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const { categories, isCategoriesLoading } = useCategoriesData();

    const handleChange = (event, newValue) => {
        selectCategory(newValue);
    };

    return (
        <Tabs
            value={activeCategory}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
                mb: 4,
                "& .MuiTab-root": {
                    textTransform: "none",
                    px: 1,
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    mx: 1,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    "&.Mui-selected": {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderColor: theme.palette.primary.dark,
                    },
                },
                "& .MuiTabs-indicator": {
                    display: "none",
                },
            }}>
            <Tab
                label="All"
                value=""
                sx={{
                    "&.Mui-selected": {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                    },
                }}
            />
            {isCategoriesLoading ? (
                <CircularProgress
                    size={20}
                    sx={{ alignSelf: "center", ml: 3 }}
                />
            ) : (
                categories.map((category) => (
                    <Tab
                        key={category.name}
                        label={
                            <Typography
                                variant="body2"
                                component="span"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}>
                                <EmojiContainer>{category.icon}</EmojiContainer>
                                {category.name}
                            </Typography>
                        }
                        value={category.name}
                    />
                ))
            )}
        </Tabs>
    );
};

export default SelectCategory;
