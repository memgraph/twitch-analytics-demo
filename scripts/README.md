# 💬 Description

This script is used to generate .csv files from which you can create your graph database. The ones which will be used are:

- `streamers.csv`
- `teams.csv`
- `vips.csv`
- `moderators.csv`
- `chatters.csv`

If you don't want to use already prepared .csv files from [here](https://github.com/memgraph/twitch-analytics-demo/tree/main/memgraph/import-data) which was scraped sometime before, then feel free to scrape new data with this scraper and place the appropriate .csv files in [/memgraph/import-data](https://github.com/memgraph/twitch-analytics-demo/tree/main/memgraph/import-data) folder.

# 👣 Instructions

To run this script you have have your own `client_id` and `client_secret`. Those two you can get by signing up to [Twitch Dev](https://dev.twitch.tv/) and following the instructions from [Twitch API](https://dev.twitch.tv/docs/api/). When you get your `client_id` and `client_secret` then you run `scraper.py` with:

```
python scraper.py <client_id> <client_secret>
```
After this, all scraped data will be written into .csv files.
