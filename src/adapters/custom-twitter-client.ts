import { TwitterClient } from "../ports/twitter-client";
import { searchTweets } from "./search-tweets";

let twitterClient: TwitterClient | null = null;

const createTwitterClient = (): TwitterClient => {
    const startTime = process.env.START_TIME || null;
    const endTime = process.env.END_TIME || null;
    const token = process.env.BEARER_TOKEN || null;
    const query = process.env.SEARCH_QUERY || null;

    if (!startTime) throw ".env START_TIME not found";
    if (!endTime) throw ".env END_TIME not found";
    if (!token) throw ".env BEARER_TOKEN not found";
    if (!query) throw ".env SEARCH_QUERY not found";

    twitterClient = {
        searchTweets,
        configs: {
            startTime,
            endTime,
            token,
            query
        }
    };

    return twitterClient;
}

export const getTwitterClient = (): TwitterClient => {
    return twitterClient || createTwitterClient();
}