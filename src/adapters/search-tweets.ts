import { TwitterClient, TwitterClientConfig } from '../ports/twitter-client';
import { DataResponse, ReferencedTweetType, SearchAllTweetsResponse } from '../models/search-all-tweets-response';
import { Tweet } from "../models/tweet"

const searchTweetsEndpoint = 'https://api.twitter.com/2/tweets/search/all';

export const searchTweets: TwitterClient["searchTweets"] = async (
    configs: TwitterClientConfig,
    nextPaginationToken: string = "", 
    tweets: Tweet[] = []
): Promise<Tweet[]> => {

    const params = buildParams(configs);

    if (nextPaginationToken !== "") {
        params.next_token = nextPaginationToken;
    };

    const response = await getTweets(params, configs.token);
    const users = getUsers(response);
    const medias = getMedias(response);
    const referencedTweets = getReferencedTweets(response);
    const newTweets = await parseResponse(response, users, medias, referencedTweets);
    const allTweets = [...tweets, ...newTweets];

    console.log(`Colected tweets: ${allTweets.length}`);

    if (response?.meta?.next_token) {
        return await searchTweets(
            configs,
            response.meta.next_token, 
            allTweets
        );
    } 

    return allTweets;
}

const buildParams = (configs: TwitterClientConfig): any => {
    const startTime = buildTimeParam(configs.startTime, "00:00:00");
    const endTime = buildTimeParam(configs.endTime, "23:59:59");

    return {
        "query": configs.query,
        "tweet.fields": "created_at,public_metrics",
        "expansions": "author_id,attachments.media_keys,referenced_tweets.id",
        "user.fields": "username",
        "media.fields": "media_key,url", 
        "max_results": "500",
        "start_time": startTime,
        "end_time": endTime,
    };
}

const parseResponse = async (
    response: SearchAllTweetsResponse, 
    users: any, 
    medias: any,
    referencedTweets: any
): Promise<Tweet[]> => {
    const tweets: Tweet[] | undefined = response?.data?.map(tweet => {
        const { ref_type, ref_text } = findFirstReferencedTweet(tweet, referencedTweets);
        return {
            author: findAuthorUsername(tweet, users),
            created_at: new Date(tweet.created_at).toLocaleString('pt-BR'),
            text: tweet.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
            likes: tweet.public_metrics.like_count,
            retweets: tweet.public_metrics.retweet_count,
            replies: tweet.public_metrics.reply_count,
            quotes: tweet.public_metrics.quote_count,
            images: findImages(tweet, medias),
            ref_type,
            ref_text
        };
    });

    if(!tweets) {
        throw new Error(response.title);
    }

    return tweets;
}

const getTweets = async (params: any, token: string): Promise<SearchAllTweetsResponse> => {
    const queryParams = new URLSearchParams(params).toString();

    const response = await fetch(`${searchTweetsEndpoint}?${queryParams}`, {
        method: 'GET',
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    if (response.status == 503) { 
        console.log("Try execute again");
        return await getTweets(params, token);
    }

    return await response.json() as SearchAllTweetsResponse;
}

const findAuthorUsername = (tweet: DataResponse, users: any): string => {
    return "@" + users[tweet.author_id] || tweet.author_id;
}

const findFirstReferencedTweet = (tweet: DataResponse, referencedTweets: any): any => {
    let ref_text: string | null = null;
    let ref_type: ReferencedTweetType | null = null;
    
    if (tweet?.referenced_tweets && tweet.referenced_tweets.length > 0) {
        let firstReferencedTweet = tweet.referenced_tweets[0];
        ref_type = firstReferencedTweet.type;
        ref_text = referencedTweets[firstReferencedTweet.id];
    }

    return { ref_type, ref_text };
}

const findImages = (tweet: DataResponse, medias: any): string[] => {
    const images: string[] = [];

    if (tweet?.attachments) {
        tweet.attachments.media_keys.forEach(media_key => {
            if (medias[media_key]) {
                images.push(medias[media_key]);
            }
        });
    }

    return images;
}

const getUsers = (response: SearchAllTweetsResponse): any => {
    const users = {};

    if (response.includes?.users) {
        response.includes.users.forEach(user => {
            users[user.id] = user.username;
        });
    }

    return users;
}

const getMedias = (response: SearchAllTweetsResponse): any => {
    const photos = {};
    
    if (response.includes?.media){
        response.includes.media.forEach(media => {
            if (media.type == "photo") {
                photos[media.media_key] = media.url;
            }
        });
    }

    return photos;
}

const getReferencedTweets = (response: SearchAllTweetsResponse): any => {
    const referencedTweets = {};

    if (response.includes?.tweets){
        response.includes.tweets.forEach(tweet => {
            referencedTweets[tweet.id] = tweet.text;
        });
    }

    return referencedTweets;
}

const buildTimeParam = (time: String, defaultHour: String): String => {
    if (time.length == 10) {
        time = `${time} ${defaultHour}`;
    }

    return `${time.replace(" ", "T")}-03:00`;
}