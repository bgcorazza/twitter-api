export interface SearchAllTweetsResponse {
    data?: DataResponse[];
    meta?: MetaResponse;
    includes?: IncludesResponse;
    title?: string;
}

export interface MetaResponse {
    newest_id: string;
    oldest_id: string;
    result_count?: number;
    next_token?: string;
}

export interface DataResponse {
    text: string;
    created_at: string;
    id: string;
    author_id: string;
    public_metrics: PublicMetricsResponse;
    attachments: AttachmentsResponse;
    referenced_tweets: ReferencedTweets[];
    geo: GeoResponse;
}

export interface GeoResponse {
    place_id: string;
}

export interface PublicMetricsResponse {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
}

export interface AttachmentsResponse {
    media_keys: string[];
}

export interface IncludesResponse {
    users: IncludeUserResponse[];
    media: IncludeMediaResponse[];
    tweets: IncludeTweetResponse[];
    places: IncludePlaceResponse[];
}

export interface IncludeUserResponse {
    id: string;
    name: string;
    username: string;
}

export interface IncludeMediaResponse {
    media_key: string;
    type: string;
    url: string;
}

export interface IncludeTweetResponse {
    id: string;
    text: string;
}

export interface IncludePlaceResponse {
    id: string;
    geo: IncludePlaceResponseGeo;
}

export interface IncludePlaceResponseGeo {
    type: string;
    bbox: Array<number>;
}

export interface ReferencedTweets {
    id: string;
    type: ReferencedTweetType;
}

export enum ReferencedTweetType {
    quoted, 
    retweeted,
    replied_to
}