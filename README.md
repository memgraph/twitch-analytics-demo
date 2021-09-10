# Twitch Analytics Demo

![](/images/app_1.png)

## Dataset

The data was collected using [Twitch API](https://dev.twitch.tv/docs/api/). The files which we'll use are located in `/memgraph/import-data/` folder and are called: `streamers.csv`, `teams.csv`, `vips.csv`, `moderators.csv` and `chatters.csv`.

## Starting the app

You can simply start the app by running:

```
docker-compose up core
docker-compose up twitch-app
docker-compose up react-app
```

To start streaming the data run:

```
docker-compose up twitch-stream
```

## General statistics

Choose from top games, teams, vips, moderators or streamers.

![](/images/app_2.png)

## Graph visualization

Find your favorite streamer or the streamers who stream your favorite game in your language.

![](/images/app_3.png)

Check out the PageRank and Betweenness Centrality MAGE algorithms.

![](/images/app_4.png)
