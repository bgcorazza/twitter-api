import { format } from '@fast-csv/format';
import { Tweet } from "../types/tweet";
import fs = require('fs');

export const exportCsv = async (tweets: Tweet[]) => {
    const stream = format({ delimiter: '\t' });
    let exportFile = fs.createWriteStream('export.csv');

    stream.write([
        "#",
        "Data",
        "Usuário",
        "Imagens",
        "Tweet"
    ]);

    tweets.forEach((tweet, index) => {
        stream.write([
            index+1,
            tweet.created_at,
            tweet.author,
            tweet.image,
            tweet.text
        ]);
    });

    stream.pipe(exportFile);
    stream.end();
}