import {
    Container,
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Paper,
    CircularProgress,
    Popover,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { Folder, Add, EmojiEmotions, Delete } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import PageLoader from "../../Animations/PageLoader";
import { useCategoriesData } from "../../Hooks/useQueryFetch/useQueryData";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import toast from "react-hot-toast";

const Category = () => {
    const { token } = useToken();
    const { categories, isCategoriesLoading, refetchCategories } =
        useCategoriesData();
    const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [btnLoad, setIsBtnLoad] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(`${serVer}/admin/new-category`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await refetchCategories();
            reset();
            setSelectedEmoji("");
            toast.success(res.data);
        } catch (error) {
            toast.error(error.response?.data || "Failed to create category");
        }
    };

    const handleEmojiClick = (emojiData) => {
        setValue("icon", emojiData.emoji);
        setSelectedEmoji(emojiData.emoji);
        setEmojiAnchorEl(null);
    };

    const handleOpenEmojiPicker = (event) => {
        setEmojiAnchorEl(event.currentTarget);
    };

    const handleCloseEmojiPicker = () => {
        setEmojiAnchorEl(null);
    };

    const handleDelete = async () => {
        setIsBtnLoad(true);
        try {
            await axios.delete(
                `${serVer}/admin/category/${categoryToDelete._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            await refetchCategories();
            toast.success("Category deleted successfully");
        } catch (error) {
            toast.error(error.response?.data || "Failed to delete category");
        } finally {
            setOpenDialog(false);
            setCategoryToDelete(null);
            setIsBtnLoad(false);
        }
    };

    if (isCategoriesLoading) return <PageLoader />;

    const sortedCategories = [...categories].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}>
                    <Folder fontSize="large" /> Categories Management
                </Typography>
            </Box>

            {/* Add Category Form */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Add New Category
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                variant="outlined"
                                {...register("name", {
                                    required: "Name is required",
                                })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                }}>
                                <TextField
                                    fullWidth
                                    label="Icon (Emoji)"
                                    variant="outlined"
                                    value={selectedEmoji}
                                    {...register("icon", {
                                        required: "Icon is required",
                                    })}
                                    error={!!errors.icon}
                                    helperText={errors.icon?.message}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    placeholder="Click to select an emoji"
                                />
                                <IconButton
                                    onClick={handleOpenEmojiPicker}
                                    sx={{ ml: 1, mb: 0.5 }}
                                    aria-label="select emoji">
                                    <EmojiEmotions
                                        fontSize="large"
                                        color="primary"
                                    />
                                </IconButton>
                            </Box>
                            <Popover
                                open={Boolean(emojiAnchorEl)}
                                anchorEl={emojiAnchorEl}
                                onClose={handleCloseEmojiPicker}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}>
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    width={300}
                                    height={350}
                                />
                            </Popover>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={
                                    isSubmitting ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <Add />
                                    )
                                }
                                disabled={isSubmitting}
                                sx={{ minWidth: 150 }}>
                                {isSubmitting ? "Adding..." : "Add Category"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Categories List */}
            <Paper elevation={3} sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Existing Categories ({sortedCategories.length})
                    </Typography>

                    <List dense={false}>
                        {sortedCategories.map((category) => (
                            <ListItem
                                key={category._id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                        borderRadius: 1,
                                    },
                                }}>
                                <Box display="flex" alignItems="center">
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: "primary.light",
                                                fontSize: "1.2rem",
                                            }}>
                                            {category.icon || <Folder />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={category.name}
                                        primaryTypographyProps={{
                                            variant: "body1",
                                            fontWeight: 500,
                                        }}
                                    />
                                </Box>

                                <IconButton
                                    onClick={() => {
                                        setCategoryToDelete(category);
                                        setOpenDialog(true);
                                    }}>
                                    <Delete color="warning" />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="confirm-delete-dialog">
                <DialogTitle id="confirm-delete-dialog">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the category{" "}
                        {categoryToDelete?.name}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        color="primary">
                        No
                    </Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        {btnLoad ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            "yes"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Category;
