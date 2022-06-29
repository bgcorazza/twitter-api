import { Tweet } from "../models/tweet";

export interface Output {
    write: (tweets: Tweet[]) => Promise<void>;
}