import { Tweet } from "../models/tweet";

export interface TwitterClient {
    searchTweets: (nextToken?: string, tweets?: Tweet[]) => Promise<Tweet[]>;
    configs: {
        startTime: string,
        endTime: string,
        token: string,
        query: string
    }
}