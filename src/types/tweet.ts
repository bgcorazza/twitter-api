export interface Tweet {
    author: string;
    created_at: string;
    text: string;
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    images: string[];
}