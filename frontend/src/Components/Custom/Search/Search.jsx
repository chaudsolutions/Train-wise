import {
    TextField,
    InputAdornment,
    IconButton,
    Box,
    useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Search = ({ searchQuery, setSearchQuery }) => {
    const theme = useTheme();

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 500,
                mx: "auto",
                mb: 4,
            }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search communities, topics, or keywords"
                value={searchQuery}
                onChange={handleInputChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton edge="start" disabled>
                                <SearchIcon
                                    size={20}
                                    color={theme.palette.text.secondary}
                                />
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: {
                        borderRadius: "50px",
                        backgroundColor: theme.palette.background.paper,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.divider,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.light,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 1,
                        },
                    },
                }}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        paddingLeft: "8px",
                    },
                }}
            />
        </Box>
    );
};

export default Search;
