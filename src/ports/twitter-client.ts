import { Tweet } from "../models/tweet";

export interface TwitterClient {
    searchTweets: (configs: TwitterClientConfig, nextToken?: string, tweets?: Tweet[]) => Promise<Tweet[]>;
    configs: TwitterClientConfig
}

export interface TwitterClientConfig {
    startTime: string,
    endTime: string,
    token: string,
    query: string
}