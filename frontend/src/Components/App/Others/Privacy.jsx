import { useEffect } from "react";

const Privacy = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

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
            info: "For privacy concerns or DSAR requests, contact our Data Protection Officer at privacy@yourplatform.com. Response within 7 business days guaranteed.",
        },
    ];

    const faqOutput = PrivacyPolicies.map((faq, i) => (
        <li key={i}>
            <h5>{faq.title}</h5>
            <p>{faq.info}</p>
        </li>
    ));

    return (
        <main className="home">
            <header>
                <h1>Privacy Policies</h1>
                <p>Privacy policies you should be aware of</p>
            </header>

            <ul className="faqUl">{faqOutput}</ul>
        </main>
    );
};

export default Privacy;
