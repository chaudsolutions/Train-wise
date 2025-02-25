import { useEffect } from "react";
import { LinkOne } from "../../Custom/Buttons/LinkBtn";
import { companyName } from "../../Hooks/useVariable";
import { imgLink } from "../../Custom/List/CommunitiesList";
import "./others.css";

const AffiliatePage = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

    const affiliate = [
        {
            name: "Share your link",
            content:
                "Share your referral link with your friends, followers, or customers.",
        },
        {
            name: "Somebody signs up",
            content:
                "When your friend signs up for Skool, they will be attributed to you.",
        },
        {
            name: "Earn 40% commission",
            content:
                "You'll earn 40% of their monthly subscription fee for life.",
        },
    ];

    const output = affiliate.map((l, i) => (
        <li key={i} className="affiliateLi">
            <img src={imgLink} />

            <h3>
                {i + 1}. {l.name}
            </h3>
            <p>{l.content}</p>
        </li>
    ));

    return (
        <main className="home">
            <header>
                <h1>Earn 40% of recurring revenue</h1>
                <p>
                    Refer people to {companyName} and earn 40% of monthly
                    recurring revenue for life. If somebody creates a group from
                    your group, we attribute it to you automatically.
                </p>
            </header>

            <LinkOne
                linkDetails={[{ name: "BECOME AN AFFILIATE", url: "/sign-up" }]}
            />

            <ul className="communitiesUl">{output}</ul>

            <ul className="communitiesUl">
                <li className="affiliateLi">
                    <h3>💰 Your group earns money automatically</h3>
                    <p>
                        If you have a group and one of your members creates a
                        group — we&apos;ll attribute the referral to you
                        automatically. This makes {companyName} an income
                        stream, not a cost.
                    </p>
                </li>
                <li className="affiliateLi">
                    <h3>📚 Get free training on how to promote it</h3>
                    <p>
                        Don&apos;t know where to begin? Learn best practices for
                        promoting {companyName} and making money. We share the
                        best methods we know so you can get up to speed fast!
                    </p>
                </li>
            </ul>
        </main>
    );
};

export default AffiliatePage;
