import { Typography, List, ListItem, ListItemText, Paper } from "@mui/material";
import { useUserNotifications } from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";

const Notifications = () => {
    const { notificationsData, isNotificationsDataLoading } =
        useUserNotifications();

    if (isNotificationsDataLoading) {
        return <PageLoader />;
    }

    return (
        <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Notifications
            </Typography>
            {notificationsData?.length > 0 ? (
                <List>
                    {notificationsData.map((notification) => (
                        <ListItem
                            key={notification._id}
                            sx={{
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                py: 1,
                            }}>
                            <ListItemText
                                primary={notification.message}
                                secondary={new Date(
                                    notification.createdAt
                                ).toLocaleString()}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography color="text.secondary">No notifications</Typography>
            )}
        </Paper>
    );
};

export default Notifications;
