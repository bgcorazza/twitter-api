import { getTwitterClient } from './custom-twitter-client';
import { TwitterClient } from '../ports/twitter-client';
import { DataResponse, SearchAllTweetsResponse } from '../models/search-all-tweets-response';
import { Tweet } from "../models/tweet"

const configs = getTwitterClient().configs;

const params: any = {
    "query": configs.query,
    "tweet.fields": "created_at,public_metrics",
    "expansions": "author_id,attachments.media_keys",
    "user.fields": "username",
    "media.fields": "media_key,url", 
    "max_results": "500",
    "start_time": `${configs.startTime}T00:00:00-03:00`,
    "end_time": `${configs.endTime}T23:59:59-03:00`,
};

export const searchTweets: TwitterClient["searchTweets"] = async (
    nextPaginationToken: string = "", 
    tweets: Tweet[] = []
): Promise<Tweet[]> => {

    if (nextPaginationToken !== "") {
        params.next_token = nextPaginationToken;
    };

    const response = await getTweets(params, configs.token);
    const users = getUsers(response);
    const medias = getMedias(response);
    const newTweets = await parseResponse(response, users, medias);
    const allTweets = [...tweets, ...newTweets];

    console.log(`Colected tweets: ${allTweets.length}`);

    if (response?.meta?.next_token) {
        return await searchTweets(
            response.meta.next_token, 
            allTweets
        );
    } 

    return allTweets;
}

const parseResponse = async (response: SearchAllTweetsResponse, users: any, medias: any): Promise<Tweet[]> => {
    const tweets: Tweet[] | undefined = response?.data?.map(tweet => {
        return {
            author: findAuthorUsername(tweet, users),
            created_at: new Date(tweet.created_at).toLocaleString('pt-BR'),
            text: tweet.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
            likes: tweet.public_metrics.like_count,
            retweets: tweet.public_metrics.retweet_count,
            replies: tweet.public_metrics.reply_count,
            quotes: tweet.public_metrics.quote_count,
            images: findImages(tweet, medias)
        };
    });

    if(!tweets) {
        throw new Error(response.title);
    }

    return tweets;
}

const getTweets = async (params: any, token: string): Promise<SearchAllTweetsResponse> => {
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
        return await getTweets(params, token);
    }

    return await response.json() as SearchAllTweetsResponse;
}

const findAuthorUsername = (tweet: DataResponse, users: any): string => {
    return "@" + users[tweet.author_id] || tweet.author_id;
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