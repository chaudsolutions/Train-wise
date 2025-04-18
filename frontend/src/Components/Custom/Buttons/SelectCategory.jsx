import { Button, Stack } from "@mui/material";
import { categories } from "../../Hooks/useVariable";
import useResponsive from "../../Hooks/useResponsive";

const SelectCategory = ({ activeCategory, selectCategory }) => {
    const { isMobile } = useResponsive();

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                mb: 4,
                flexWrap: isMobile ? "nowrap" : "wrap",
                justifyContent: isMobile ? "flex-start" : "center",
                overflowX: isMobile ? "auto" : "visible",
                px: isMobile ? 2 : 0,
                py: isMobile ? 1 : 0,
                scrollbarWidth: "none", // For Firefox
                "&::-webkit-scrollbar": {
                    // For Chrome/Safari
                    display: "none",
                },
                "& button": {
                    textTransform: "none",
                    flexShrink: 0, // Prevent buttons from shrinking on small screens
                    whiteSpace: "nowrap", // Keep button text on one line
                },
            }}>
            <Button
                variant={activeCategory === "" ? "contained" : "outlined"}
                color="info"
                onClick={() => selectCategory("")}>
                All
            </Button>
            {categories.map((category, i) => (
                <Button
                    key={i}
                    variant={
                        activeCategory === category.name
                            ? "contained"
                            : "outlined"
                    }
                    color="info"
                    onClick={() => selectCategory(category.name)}
                    startIcon={category.icon}>
                    {category.name}
                </Button>
            ))}
        </Stack>
    );
};

export default SelectCategory;
