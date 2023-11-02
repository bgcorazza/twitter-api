# twitter-api

## Dependencies 
- [NodeJS](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

## Configuration

Use the `.env.example` file to create a `.env` file with the configurations to run your search.

```
copy .env.example .env
``` 

To run this project you will need a Twitter developer account with `Academic Reserach` privileges, and generate a `Bearer Token` to use on `BEARER_TOKEN` enviroment variable.

To build a `SEARCH_QUERY` see [this documentation](https://developer.twitter.com/en/docs/twitter-api/tweets/counts/integrate/build-a-query)

`START_TIME` and `END_TIME` follow the pattern: `YYYY-MM-DD`.

## Run

After install all dependencies and fill the configurations, you can run this command:

```
yarn start
```
