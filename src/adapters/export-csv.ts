import { format } from '@fast-csv/format';
import { Tweet } from "../types/tweet";
import fs = require('fs');

export const exportCsv = async (tweets: Tweet[]) => {
    const stream = format({ delimiter: '\t' });
    let exportFile = fs.createWriteStream('export.csv');

    stream.write([
        "Data",
        "Usuário",
        "Tweet",
        "Imagens"
    ]);

    tweets.forEach((tweet) => {
        let row = [
            tweet.created_at,
            tweet.author,
            tweet.text
        ]

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