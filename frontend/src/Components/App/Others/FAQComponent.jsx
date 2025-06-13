import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Container,
    Typography,
    useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";

const FAQComponent = () => {
    const theme = useTheme();

    const FAQs = [
        {
            title: "How do I create a community?",
            info: (
                <>
                    Creating a community is easy! Just follow these steps:
                    <Box component="ol" sx={{ pl: 2, my: 1 }}>
                        <li>
                            Go to communities pages and click &apos;Create a
                            Community&apos;
                        </li>
                        <li>
                            Fill in your community details (name, description,
                            category)
                        </li>
                        <li>Upload banner and logo images</li>
                        <li>Set your subscription model (free or paid)</li>
                        <li>Review and launch your community</li>
                    </Box>
                    <Button
                        component={Link}
                        to="/tutorial"
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}>
                        View Step-by-Step Tutorial
                    </Button>
                </>
            ),
        },
        {
            title: "Can I switch a free community to paid later?",
            info: "Yes! Admins can upgrade free communities to paid at any time through the community settings.",
        },
        {
            title: "What payment methods are supported?",
            info: "We support credit/debit cards, PayPal, and Stripe. Admins receive payments through their connected payment processor.",
        },
        {
            title: "How do I join a paid community?",
            info: "Users can click 'Join' on any community page, complete payment via secure checkout, and gain instant access.",
        },
        {
            title: "Are there platform fees?",
            info: "We charge a 5% platform fee on all paid community transactions. Free communities have no fees.",
        },
        {
            title: "How do I manage community members?",
            info: "Admins can approve/remove members, assign roles, and track engagement through the member management dashboard.",
        },
        {
            title: "Is content ownership protected?",
            info: "100%. Admins retain full rights to their community content - we never claim ownership.",
        },
        {
            title: "Can users access communities on mobile?",
            info: "Yes! Our platform is fully responsive and works on all devices via web browser.",
        },
        {
            title: "What happens if I leave a community?",
            info: "You'll lose access to private content but retain any downloadable resources acquired during membership.",
        },
        {
            title: "How do refunds work?",
            info: "Refund policies are set by community admins. Contact them directly for refund requests.",
        },
        {
            title: "Can I message other members?",
            info: "Yes! Members can interact via direct messaging and community discussion threads.",
        },
        {
            title: "How are payments processed?",
            info: "We use PCI-compliant payment gateways (Stripe/PayPal) to ensure secure transactions for both admins and members.",
        },
        {
            title: "How do I report inappropriate content?",
            info: "Use our 'Report Content' button on any post/profile. Our team reviews reports within 24 hours.",
        },
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box textAlign="center" mb={4}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                    }}>
                    Frequently Asked Questions
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Find answers to common questions about our platform
                </Typography>
            </Box>

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
                {FAQs.map((faq, index) => (
                    <Accordion key={index} elevation={0}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon color="primary" />}
                            sx={{
                                backgroundColor: theme.palette.primary.light,
                                "&:hover": {
                                    backgroundColor:
                                        theme.palette.primary.light,
                                },
                                "&.Mui-expanded": {
                                    backgroundColor:
                                        theme.palette.primary.light,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                },
                            }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {faq.title}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                backgroundColor: theme.palette.background.paper,
                                py: 3,
                            }}>
                            <Typography component="div" color="text.secondary">
                                {faq.info}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Container>
    );
};

export default FAQComponent;
