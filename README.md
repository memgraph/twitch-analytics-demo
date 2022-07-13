<h1 align="center">
  Twitch Analytics Demo
</h1>

## :open_file_folder: Dataset
The data was collected using [Twitch API](https://dev.twitch.tv/docs/api/). The files which we'll use are located in `/backend/import-data/` folder and are called: `streamers.csv`, `teams.csv`, `vips.csv`, `moderators.csv` and `chatters.csv`.

## :arrow_forward: Starting the app

You can simply start the app by running:

```
docker-compose build
docker-compose up core
docker-compose up twitch-app
```

If you get the error `mgclient.OperationalError: couldn't connect to host: Connection refused` please try running `docker-compose up twitch-app` again.
When data loading is done, run:

```
docker-compose up react-app
```

Check out the app at `localhost:3000`.

To start streaming the rest of the data run:

```
docker-compose up twitch-stream
```

Notice how the number of nodes and edges are changing on the navigation bar. Also if you refresh the results of the PageRank below, you'll see the rank difference.

## :bar_chart: General statistics

Choose from top games, teams, vips, moderators or streamers.

![](/images/app_2.png)

## :eyes: Graph visualization

Find your favorite streamer or the streamers who stream your favorite game in your language.

![](/images/app_3.png)

Check out the **PageRank** and **Betweenness Centrality** [MAGE](https://memgraph.com/docs/mage) algorithms.

![](/images/app_4.png)
