import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { useCommunitiesData } from "./useQueryFetch/useQueryData";

export const useEnhancedSearch = () => {
    const { communities: allCommunities, isCommunitiesLoading } =
        useCommunitiesData();
    const [query, setQuery] = useState("");

    // Setup Fuse instance only when data is ready
    const fuse = useMemo(() => {
        if (!allCommunities || allCommunities.length === 0) return null;

        return new Fuse(allCommunities, {
            keys: [
                "name",
                "description",
                "category",
                // Add any other searchable fields from your community data
            ],
            includeScore: true,
            threshold: 0.4, // Same as your products implementation
            minMatchCharLength: 2, // Require at least 2 characters to match
        });
    }, [allCommunities]);

    // Run search when query or fuse instance changes
    const searchResults = useMemo(() => {
        if (!fuse || !query.trim()) return allCommunities || [];
        return fuse.search(query).map((result) => result.item);
    }, [fuse, query, allCommunities]);

    return {
        searchResults,
        searchQuery: query,
        setSearchQuery: setQuery,
        isLoading: isCommunitiesLoading,
        allCommunities,
        hasSearched: !!query.trim(), // Flag to indicate if a search was performed
    };
};
