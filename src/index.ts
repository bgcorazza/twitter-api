import "./setup-env";
import { getOutputAdapter } from './adapters/output-adapter';
import { Output } from './ports/output';
import { getTwitterClient } from "./adapters/custom-twitter-client";
import { TwitterClient } from "./ports/twitter-client";

const twitterClient: TwitterClient = getTwitterClient();
const outputAdapter: Output = getOutputAdapter();

const main = async () => {
  try {
    const tweets = await twitterClient.searchTweets();
    await outputAdapter.write(tweets);
  } catch (e) {
      console.error(e);
  }
};

main();
