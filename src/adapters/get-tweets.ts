import { Tweet } from "../types/tweet"
import needle = require('needle');
import * as dotenv from "dotenv";

export const getTweets = async (
    nextToken: string = "", 
    previousTweets: Tweet[] = [],
    result_count: number = 0
): Promise<Tweet[]> => {
    dotenv.config();

    const endpointUrl = 'https://api.twitter.com/2/tweets/search/all';
    const startTime = "2021-03-13";
    const endTime = "2021-06-06";
    const token = process.env.BEARER_TOKEN;

    if (!token)
        throw ".env BEARER_TOKEN not found";

    /*
    #bolsonarogenocida
    só em portugues
    sem replies
    sem retweets
    de 13/03/2021 até 06/06/2021
    */

    let params: any = {
        "query": "#bolsonarogenocida -is:retweet -is:reply lang:pt",
        "tweet.fields": "created_at",
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

    const response = await needle('get', endpointUrl, params, {
        headers: {
            "User-Agent": "v2FullArchiveJS",
            "authorization": `Bearer ${token}`
        }
    });

    let users = getUsers(response);
    let medias = getMedias(response);

    let tweets: Tweet[] = [];
    if (previousTweets.length > 0) {
        tweets = previousTweets;
    }

    if (response.body?.meta.result_count) {
        result_count = result_count + response.body.meta.result_count;
    }

    if (response.body?.data) {
        response.body.data.forEach(tweet => {
            tweets.push({
                author: findAuthorUsername(tweet, users),
                created_at: new Date(tweet.created_at).toLocaleString('pt-BR'),
                text: tweet.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
                images: findImages(tweet, medias)
            });
        });
    }

    console.log(`Tweets coletados: ${result_count}`);

    if (tweets.length > 0) {
        if (response.body.meta?.next_token) {
            return await getTweets(
                response.body.meta.next_token, 
                tweets,
                result_count
            );
        } 

        return tweets;
    } else {
        throw new Error(response.body);
    }
}

const findAuthorUsername = (tweet: any, users: any): string => {
    return "@" + users[tweet.author_id] || tweet.author_id;
}

const findImages = (tweet: any, medias: any): string[] => {
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

const getUsers = (response: any): any => {
    let users = {};

    if (response.body.includes?.users) {
        response.body.includes.users.forEach(user => {
            users[user.id] = user.username;
        });
    }

    return users;
}

const getMedias = (response: any): any => {
    let photos = {};
    
    if (response.body.includes?.media){
        response.body.includes.media.forEach(media => {
            if (media.type == "photo") {
                photos[media.media_key] = media.url;

            }
        });
    }

    return photos;
}