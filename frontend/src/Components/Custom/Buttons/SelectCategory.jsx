import {
    CircularProgress,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useCategoriesData } from "../../Hooks/useQueryFetch/useQueryData";

const SelectCategory = ({ activeCategory, selectCategory }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
                    minHeight: "auto",
                    padding: isMobile ? "6px 12px" : "8px 16px",
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    minWidth: "unset",
                    margin: "0 4px",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    "&.Mui-selected": {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderColor: theme.palette.primary.main,
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
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}>
                                <span
                                    style={{
                                        marginRight: 8,
                                        fontSize: "1.2rem",
                                    }}>
                                    {category.icon}
                                </span>
                                {category.name}
                            </span>
                        }
                        value={category.name}
                    />
                ))
            )}
        </Tabs>
    );
};

export default SelectCategory;
