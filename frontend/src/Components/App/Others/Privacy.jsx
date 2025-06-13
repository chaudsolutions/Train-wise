import {
    Container,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { companyName } from "../../Hooks/useVariable";

const Privacy = () => {
    const theme = useTheme();

    const PrivacyPolicies = [
        {
            title: "Data Collection",
            info: "We collect information you provide during registration, community interactions, and transactions. This includes name, email, payment details, and user-generated content.",
        },
        {
            title: "Data Usage",
            info: "Your data is used to deliver services, process payments, personalize experiences, and communicate platform updates. We never sell your data to third parties.",
        },
        {
            title: "Third-Party Sharing",
            info: "We only share necessary data with trusted service providers (payment processors, hosting services) to operate the platform. Full list available upon request.",
        },
        {
            title: "Data Security",
            info: "We use SSL encryption, regular security audits, and restricted access protocols to protect user data. Payment details are processed through PCI-compliant gateways.",
        },
        {
            title: "User Rights",
            info: "You can access, correct, or delete personal data through your account settings. Contact us for data export requests under GDPR provisions.",
        },
        {
            title: "Cookies & Tracking",
            info: "We use essential cookies for platform functionality and optional analytics cookies. Manage preferences through your browser or our cookie consent banner.",
        },
        {
            title: "Minors' Privacy",
            info: "Our platform is not designed for users under 13. We do not knowingly collect data from children and will delete such accounts if identified.",
        },
        {
            title: "International Data Transfers",
            info: "Data may be processed globally through our cloud infrastructure, always protected by GDPR-standard data protection agreements.",
        },
        {
            title: "Policy Updates",
            info: "We'll notify users via email and platform banners about significant policy changes. Continued use after updates constitutes acceptance.",
        },
        {
            title: "Community Content Responsibility",
            info: "Individual community admins are responsible for their members' data handling. Review each community's privacy practices before joining.",
        },
        {
            title: "Data Retention",
            info: "We retain account data until deletion is requested. Deleted communities' content is permanently erased within 90 days.",
        },
        {
            title: "Account Deletion",
            info: "Deleting your account permanently removes personal data from our servers, excluding legal/transactional records we're required to maintain.",
        },
        {
            title: "Analytics Data",
            info: "We collect aggregated usage statistics to improve services. Individual user behavior is never shared with community admins without consent.",
        },
        {
            title: "Third-Party Links",
            info: "We're not responsible for privacy practices on external websites linked through community content. Always review third-party policies.",
        },
        {
            title: "Consent Basis",
            info: "By using our platform, you consent to data practices outlined in this policy. Withdraw consent by discontinuing platform use and deleting your account.",
        },
        {
            title: "Contact Information",
            info: `For privacy concerns or DSAR requests, contact our Data Protection Officer at support@${window.location.host}. Response within 7 business days guaranteed.`,
        },
    ];

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* Header Section */}
            <Box textAlign="center" mb={6}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                    }}>
                    Privacy Policy
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Last updated: {new Date().toLocaleDateString()}
                </Typography>
            </Box>

            {/* Introduction */}
            <Box mb={4}>
                <Typography variant="body1" paragraph>
                    At {companyName}, we take your privacy seriously. This
                    policy explains how we collect, use, and protect your
                    personal information when you use our platform.
                </Typography>
                <Typography variant="body1" paragraph>
                    By accessing or using our services, you agree to the terms
                    outlined in this Privacy Policy.
                </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Policies */}
            <Box
                sx={{
                    "& .MuiAccordion-root": {
                        mb: 2,
                        borderRadius: "8px !important",
                        overflow: "hidden",
                        "&:before": {
                            display: "none",
                        },
                    },
                }}>
                {PrivacyPolicies.map((policy, index) => (
                    <Accordion key={index} elevation={1}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon color="primary" />}
                            sx={{
                                backgroundColor: theme.palette.background.paper,
                                "&:hover": {
                                    backgroundColor: theme.palette.action.hover,
                                },
                                "&.Mui-expanded": {
                                    backgroundColor:
                                        theme.palette.action.selected,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                },
                            }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {policy.title}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ py: 3 }}>
                            <Typography color="text.secondary">
                                {policy.info}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            {/* Footer Note */}
            <Box mt={6} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    For any questions about our privacy practices, please
                    contact us at privacy@{companyName}.com
                </Typography>
            </Box>
        </Container>
    );
};

export default Privacy;
