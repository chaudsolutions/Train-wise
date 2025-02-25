import { faker } from "@faker-js/faker";
import { categories } from "./useVariable";

// Generate a community title
export const generateCommunityTitle = () => faker.lorem.words(3);

// Generate a community creator name
export const generateCommunityCreatorName = () => faker.person.fullName();

// Generate a community image URL
export const generateCommunityImageURL = () => faker.image.url();

// Helper function to format member count
const formatMemberCount = (count) => {
    if (count >= 1000) {
        // Formats the number to one decimal place followed by "K"
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
};

// Generate a full community object
const generateCommunityData = () => {
    const title = generateCommunityTitle();

    const creatorName = generateCommunityCreatorName();

    const communityLogo = generateCommunityImageURL();

    const communityBg = generateCommunityImageURL();

    const description = faker.lorem.paragraph();

    const rules = [
        faker.lorem.sentence(3),
        faker.lorem.sentence(3),
        faker.lorem.sentence(3),
    ];

    const reasons = [
        faker.lorem.sentence(3),
        faker.lorem.sentence(3),
        faker.lorem.sentence(3),
    ];

    const features = [
        faker.lorem.sentence(3),
        faker.lorem.sentence(3),
        faker.lorem.sentence(3),
    ];

    // Pick a random category from your categories array
    const category = faker.helpers.arrayElement(categories.map((c) => c.name));

    // Decide randomly if the community is free or paid
    const isPaid = faker.datatype.boolean();

    const price = isPaid
        ? `$${faker.commerce.price(5, 100, 2, "$")}/month`
        : "Free";

    // Random creation date in the past
    const createdAt = faker.date.past();

    // Generate a random member count between 50 and 10,000
    const memberCount = faker.number.int({ min: 50, max: 10000 });
    const members = formatMemberCount(memberCount);

    return {
        title,
        creatorName,
        communityLogo,
        communityBg,
        description,
        rules,
        reasons,
        features,
        category,
        price,
        members,
        createdAt,
    };
};

let communities = [];

// Generate an array of communities for your mock data
export const generateCommunities = (count = 50) => {
    if (communities.length === 0) {
        communities = Array.from({ length: count }, () =>
            generateCommunityData()
        );
    }

    return { communities, oneCommunity: communities[0] };
};
