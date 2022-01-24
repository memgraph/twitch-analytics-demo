<h1 align="center">
  Twitch Analytics Demo
</h1>

## :open_file_folder: Dataset
The data was collected using [Twitch API](https://dev.twitch.tv/docs/api/). The files which we'll use are located in `/backend/import-data/` folder and are called: `streamers.csv`, `teams.csv`, `vips.csv`, `moderators.csv` and `chatters.csv`.

## :arrow_forward: Starting the app

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

## :bar_chart: General statistics

Choose from top games, teams, vips, moderators or streamers.

![](/images/app_2.png)

## :eyes: Graph visualization

Find your favorite streamer or the streamers who stream your favorite game in your language.

![](/images/app_3.png)

Check out the **PageRank** and **Betweenness Centrality** [MAGE](https://memgraph.com/docs/mage) algorithms.

![](/images/app_4.png)
