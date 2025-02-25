import { useEffect } from "react";

const FAQComponent = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

    const FAQs = [
        {
            title: "How do I create a community?",
            info: "Admins can create communities by clicking 'Create Community' in their dashboard, choosing between free/paid options, and setting up their community details.",
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
            title: "Can I customize my community's layout?",
            info: "Yes! Admins get drag-and-drop tools to organize courses, forums, and resources in their community space.",
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
            title: "Can I preview content before joining?",
            info: "Admins can choose to display free preview lessons or community descriptions to non-members.",
        },
        {
            title: "How do I report inappropriate content?",
            info: "Use our 'Report Content' button on any post/profile. Our team reviews reports within 24 hours.",
        },
    ];

    const faqOutput = FAQs.map((faq, i) => (
        <li key={i}>
            <h5>{faq.title}</h5>
            <p>{faq.info}</p>
        </li>
    ));

    return (
        <main className="home">
            <header>
                <h1>FAQ</h1>
                <p>Frequently Asked Questions</p>
            </header>

            <ul className="faqUl">{faqOutput}</ul>
        </main>
    );
};

export default FAQComponent;
