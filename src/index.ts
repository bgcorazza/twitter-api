
import { getTweets } from "./adapters/get-tweets";
import { exportCsv } from "./adapters/export-csv";

const main = async () => {
  try {
    const response = await getTweets();
    exportCsv(response);
  } catch (e) {
      console.error(e);
  }
};

main();
