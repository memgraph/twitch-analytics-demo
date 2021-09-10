# Twitch Analytics Demo

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
