import { Output } from './../ports/output';
import { format } from '@fast-csv/format';
import { Tweet } from "../models/tweet";
import { ReferencedTweetType } from '../models/csv';
import fs = require('fs');

export const write: Output["write"] = async (tweets: Tweet[]) => {
    const stream = format({ delimiter: '\t' });
    let exportFile = fs.createWriteStream('export.csv');

    stream.write([
        "Data",
        "Usuário",
        "Tweet",
        "Curtidas",
        "Retweets",
        "Respostas",
        "Citações",
        "Latitude",
        "Longitude",
        "Tipo de Referência",
        "Tweet Referenciado",
        "Imagens"
    ]);

    tweets.forEach((tweet) => {
        let row = [
            tweet.created_at,
            tweet.author,
            tweet.text,
            tweet.likes,
            tweet.retweets,
            tweet.replies,
            tweet.quotes,
            tweet.latitude,
            tweet.longitude,
            ReferencedTweetType[tweet.ref_type],
            tweet.ref_text
        ];

        tweet.images.forEach((image) => {
            row.push(`=image("${image}")`);
        });

        // Placeholder quando tem imagem para cécula ficar grande
        if (tweet.images.length > 0)
            row.push("\n\n\n\n\n\n\n\n\n\n\n\n\n\n");

        stream.write(row);
    });

    stream.pipe(exportFile);
    stream.end();
}