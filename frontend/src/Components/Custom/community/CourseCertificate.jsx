import { Box, Typography, Button, Card, Avatar } from "@mui/material";
import Download from "@mui/icons-material/Download";
import certificateBg from "../../../assets/cert/certBg.png";
import moment from "moment";

const CourseCertificate = ({
    courseName,
    duration,
    userName,
    completionDate,
    communityName,
    communityCreator,
}) => {
    // Format the date using moment.js
    const formattedDate = moment(completionDate).format("Do MMMM YYYY");

    const handleDownload = () => {};

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Card
                sx={{
                    width: 800,
                    height: 500,
                    background: `url(${certificateBg}) no-repeat center`,
                    backgroundSize: "cover",
                    border: "1px solid #e0e0e0",
                    boxShadow: 3,
                    p: 2,
                }}>
                <Box>
                    <Avatar
                        src="/logo.png"
                        alt="logo"
                        sx={{
                            width: 120,
                            height: 80,
                            mixBlendMode: "exclusion",
                        }}
                    />
                </Box>

                <Box px={2} color="#fff" display="grid" gap={2.5}>
                    <Box>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: "bold",
                            }}>
                            CERTIFICATE
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: "bold",
                            }}>
                            OF COMPLETION
                        </Typography>
                    </Box>
                    <Box display="grid" gap={3}>
                        <Typography variant="body1">
                            This is to certify that
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{
                                color: "primary.main",
                                fontWeight: "bold",
                            }}>
                            {userName}
                        </Typography>

                        <Typography variant="body1">
                            Has successfully completed an {duration}-week
                            programme with{" "}
                            <Typography
                                variant="span"
                                sx={{
                                    color: "primary.main",
                                    fontWeight: "bold",
                                }}>
                                {courseName}
                            </Typography>
                            <Typography variant="body1">
                                on {formattedDate}.
                            </Typography>
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 4,
                        }}>
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}>
                                JONATHAN RAY
                            </Typography>
                            <Typography variant="caption">
                                SkillBay Talent Acquisition Manager
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}>
                                {(
                                    communityCreator || "John Abah"
                                ).toUpperCase()}
                            </Typography>
                            <Typography variant="caption">
                                Founder | {communityName}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Card>

            <Button
                variant="contained"
                onClick={handleDownload}
                startIcon={<Download />}
                sx={{ mt: 4 }}>
                Download Certificate
            </Button>
        </Box>
    );
};

export default CourseCertificate;
