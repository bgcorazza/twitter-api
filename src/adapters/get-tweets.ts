import { DataResponse, SearchAllTweetsResponse } from '../types/search-all-tweets-response';
import { Tweet } from "../types/tweet"
import * as dotenv from "dotenv";

dotenv.config();

export const getTweets = async (
    nextToken: string = "", 
    previousTweets: Tweet[] = [],
    result_count: number = 0
): Promise<Tweet[]> => {

    const startTime = process.env.START_TIME || null;
    const endTime = process.env.END_TIME || null;
    const token = process.env.BEARER_TOKEN || null;
    const query = process.env.SEARCH_QUERY || null;

    if (!startTime) throw ".env START_TIME not found";
    if (!endTime) throw ".env END_TIME not found";
    if (!token) throw ".env BEARER_TOKEN not found";
    if (!query) throw ".env SEARCH_QUERY not found";

    let params: any = {
        "query": query,
        "tweet.fields": "created_at,public_metrics",
        "expansions": "author_id,attachments.media_keys",
        "user.fields": "username",
        "media.fields": "media_key,url", 
        "max_results": "500",
        "start_time": `${startTime}T00:00:00-03:00`,
        "end_time": `${endTime}T23:59:59-03:00`,
    }

    if (nextToken !== "") {
        params = {
            ...params,
            "next_token": nextToken
        }
    };

    let response = await tryExecute(params, token);
    let users = getUsers(response);
    let medias = getMedias(response);

    let tweets: Tweet[] = [];
    if (previousTweets.length > 0) {
        tweets = previousTweets;
    }

    if (response?.meta?.result_count) {
        result_count = result_count + response.meta.result_count;
    }

    if (response?.data) {
        response.data.forEach(tweet => {
            tweets.push({
                author: findAuthorUsername(tweet, users),
                created_at: new Date(tweet.created_at).toLocaleString('pt-BR'),
                text: tweet.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
                likes: tweet.public_metrics.like_count,
                retweets: tweet.public_metrics.retweet_count,
                replies: tweet.public_metrics.reply_count,
                quotes: tweet.public_metrics.quote_count,
                images: findImages(tweet, medias)
            });
        });
    }

    console.log(`Colected tweets: ${result_count}`);

    if (tweets.length > 0) {
        if (response.meta?.next_token) {
            return await getTweets(
                response.meta.next_token, 
                tweets,
                result_count
            );
        } 

        return tweets;
    }

    throw new Error(response.title);
}

const tryExecute = async (params: any, token: string): Promise<SearchAllTweetsResponse> => {
    const queryParams = new URLSearchParams(params).toString();
    const endpointUrl = 'https://api.twitter.com/2/tweets/search/all?' + queryParams;

    const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    if (response.status == 503) { 
        console.log("Try execute again");
        return await tryExecute(params, token);
    }

    return await response.json() as SearchAllTweetsResponse;
}

const findAuthorUsername = (tweet: DataResponse, users: any): string => {
    return "@" + users[tweet.author_id] || tweet.author_id;
}

const findImages = (tweet: DataResponse, medias: any): string[] => {
    let images: string[] = [];

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
    let users = {};

    if (response.includes?.users) {
        response.includes.users.forEach(user => {
            users[user.id] = user.username;
        });
    }

    return users;
}

const getMedias = (response: SearchAllTweetsResponse): any => {
    let photos = {};
    
    if (response.includes?.media){
        response.includes.media.forEach(media => {
            if (media.type == "photo") {
                photos[media.media_key] = media.url;

            }
        });
    }

    return photos;
}