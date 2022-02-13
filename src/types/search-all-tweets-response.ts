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
    users: UserResponse[];
    media: MediaResponse[];
}

export interface UserResponse {
    id: string;
    name: string;
    username: string;
}

export interface MediaResponse {
    media_key: string;
    type: string;
    url: string;
}