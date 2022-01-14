from argparse import ArgumentParser
from flask import Flask, Response, render_template
from gqlalchemy import Memgraph, Node, Field, Relationship, Match
from pathlib import Path
from json import dumps
import logging
import os
import time
from functools import wraps
from csv import reader
import traceback

log = logging.getLogger(__name__)
app = Flask(
    __name__,
)
memgraph = Memgraph()


def log_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start_time
        log.info(f"Time for {func.__name__} is {duration}")
        return result

    return wrapper


def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")
    logging.getLogger("werkzeug").setLevel(logging.WARNING)


def parse_args():
    """Parse command line arguments."""

    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0", help="Host address.")
    parser.add_argument("--port", default=5000, type=int, help="App port.")
    parser.add_argument(
        "--debug",
        default=True,
        action="store_true",
        help="Run web server in debug mode.",
    )
    parser.add_argument(
        "--populate",
        dest="populate",
        action="store_true",
        help="Run app with data loading.",
    )
    parser.set_defaults(populate=False)
    log.info(__doc__)
    return parser.parse_args()


args = parse_args()


class User(Node):
    name: str = Field(index=True, unique=True, db=memgraph)


class Stream(Node, labels={"User", "Stream"}):
    name: str = Field(index=True, unique=True, db=memgraph, label="User")
    id: str = Field(index=True, unique=True, db=memgraph)
    url: str = Field()
    followers: int = Field()
    createdAt: str = Field()
    totalViewCount: int = Field()
    description: str = Field()


class Language(Node):
    name: str = Field(unique=True, db=memgraph)


class Game(Node):
    name: str = Field(unique=True, db=memgraph)


class Team(Node):
    name: str = Field(unique=True, db=memgraph)


class Speaks(Relationship, type="SPEAKS"):
    pass


class Plays(Relationship, type="PLAYS"):
    pass


class IsPartOf(Relationship, type="IS_PART_OF"):
    pass


class Vip(Relationship, type="VIP"):
    pass


class Moderator(Relationship, type="MODERATOR"):
    pass


class Chatter(Relationship, type="CHATTER"):
    pass


def load_streams(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = Stream(
                    id=row[1],
                    name=row[3],
                    url=row[6],
                    followers=row[7],
                    createdAt=row[10],
                    totalViewCount=row[9],
                    description=row[8],
                ).save(memgraph)

                language = Language(name=row[5]).save(memgraph)
                game = Game(name=row[4]).save(memgraph)

                speaks_rel = Speaks(
                    _start_node_id=stream._id, _end_node_id=language._id
                ).save(memgraph)

                plays_rel = Plays(
                    _start_node_id=stream._id, _end_node_id=game._id
                ).save(memgraph)


def load_teams(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = next(
                    Match()
                    .node("Stream", variable="stream")
                    .where("stream.id", "=", row[0])
                    .execute()
                )["stream"]
                team = Team(name=row[1]).save(memgraph)
                is_part_of_rel = IsPartOf(
                    _start_node_id=stream._id, _end_node_id=team._id
                ).save(memgraph)


def load_vips(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = next(
                    Match()
                    .node("Stream", variable="s")
                    .where("s.id", "=", row[0])
                    .execute()
                )["s"]
                vip = User(name=row[1]).save(memgraph)
                vip_rel = Vip(_start_node_id=vip._id, _end_node_id=stream._id).save(
                    memgraph
                )


def load_moderators(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = next(
                    Match()
                    .node("Stream", variable="s")
                    .where("s.id", "=", row[0])
                    .execute()
                )["s"]
                moderator = User(name=row[1]).save(memgraph)
                moderator_rel = Moderator(
                    _start_node_id=moderator._id, _end_node_id=stream._id
                ).save(memgraph)


def load_chatters(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = next(
                    Match()
                    .node("Stream", variable="s")
                    .where("s.id", "=", row[0])
                    .execute()
                )["s"]
                chatter = User(name=row[1]).save(memgraph)
                chatter_rel = Chatter(
                    _start_node_id=chatter._id, _end_node_id=stream._id
                ).save(memgraph)


@log_time
def load_twitch_data():
    path_streams = Path("import-data/streamers.csv")
    path_teams = Path("import-data/teams.csv")
    path_vips = Path("import-data/vips.csv")
    path_moderators = Path("import-data/moderators.csv")
    path_chatters = Path("import-data/chatters.csv")

    load_streams(path_streams)
    load_teams(path_teams)
    load_vips(path_vips)
    load_moderators(path_moderators)
    load_chatters(path_chatters)


@app.route("/page-rank", methods=["GET"])
@log_time
def get_page_rank():
    """Call the Page rank procedure and return top 50 in descending order."""

    try:
        results = memgraph.execute_and_fetch(
            """CALL pagerank.get()
            YIELD node, rank
            WITH node, rank
            WHERE node:Stream OR node:User
            RETURN node, rank
            ORDER BY rank DESC
            LIMIT 50; """
        )

        page_rank_dict = dict()
        page_rank_list = list()

        for result in results:
            user_name = result["node"].name
            rank = float(result["rank"])
            page_rank_dict = {"name": user_name, "rank": rank}
            dict_copy = page_rank_dict.copy()
            page_rank_list.append(dict_copy)

        response = {"page_rank": page_rank_list}

        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching users' ranks using pagerank went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/betweenness-centrality", methods=["GET"])
@log_time
def get_bc():
    """Call the Betweenness centrality procedure and return top 50 in descending order."""

    try:
        results = memgraph.execute_and_fetch(
            """CALL betweenness_centrality.get()
            YIELD node, betweenness_centrality
            WITH node, betweenness_centrality
            WHERE node:Stream OR node:User
            RETURN node, betweenness_centrality
            ORDER BY betweenness_centrality DESC
            LIMIT 50;"""
        )

        bc_dict = dict()
        bc_list = list()

        for result in results:
            user_name = result["node"].name
            bc = float(result["betweenness_centrality"])
            bc_dict = {"name": user_name, "betweenness_centrality": bc}
            dict_copy = bc_dict.copy()
            bc_list.append(dict_copy)

        response = {"bc": bc_list}

        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching betweenness centrality went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-streamers-by-views/<num_of_streamers>", methods=["GET"])
@log_time
def get_top_streamers_by_views(num_of_streamers):
    """Get top num_of_streamers streamers by total number of views."""

    try:

        results = memgraph.execute_and_fetch(
            f"""MATCH(u:Stream)
            RETURN u.name as streamer, u.totalViewCount as total_view_count
            ORDER BY total_view_count DESC
            LIMIT {num_of_streamers};"""
        )

        streamers_list = list()
        views_list = list()

        for result in results:
            streamer_name = result["streamer"]
            total_views = result["total_view_count"]
            streamers_list.append(streamer_name)
            views_list.append(total_views)

        streamers = [{"name": streamer_name} for streamer_name in streamers_list]
        views = [{"views": view_count} for view_count in views_list]
        response = {"streamers": streamers, "views": views}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top streamers by views went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-streamers-by-followers/<num_of_streamers>", methods=["GET"])
@log_time
def get_top_streamers_by_followers(num_of_streamers):
    """Get top num_of_streamers streamers by total number of followers."""

    try:
        results = memgraph.execute_and_fetch(
            f"""MATCH(u:Stream)
            RETURN u.name as streamer, u.followers as num_of_followers
            ORDER BY num_of_followers DESC
            LIMIT {num_of_streamers};"""
        )

        streamers_list = list()
        followers_list = list()

        for result in results:
            streamer_name = result["streamer"]
            num_of_followers = result["num_of_followers"]
            streamers_list.append(streamer_name)
            followers_list.append(num_of_followers)

        streamers = [{"name": streamer_name} for streamer_name in streamers_list]
        followers = [{"followers": follower_count} for follower_count in followers_list]

        response = {"streamers": streamers, "followers": followers}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top streamers by followers went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-games/<num_of_games>", methods=["GET"])
@log_time
def get_top_games(num_of_games):
    """Get top num_of_games games by number of streamers who play them."""

    try:
        results = memgraph.execute_and_fetch(
            f"""MATCH (u:User)-[:PLAYS]->(g:Game)
            RETURN g.name as game_name, COUNT(u) as number_of_players
            ORDER BY number_of_players DESC
            LIMIT {num_of_games};"""
        )

        games_list = list()
        players_list = list()

        for result in results:
            game_name = result["game_name"]
            num_of_players = result["number_of_players"]
            games_list.append(game_name)
            players_list.append(num_of_players)

        games = [{"name": game_name} for game_name in games_list]
        players = [{"players": player_count} for player_count in players_list]

        response = {"games": games, "players": players}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top games went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-teams/<num_of_teams>", methods=["GET"])
@log_time
def get_top_teams(num_of_teams):
    """Get top num_of_teams teams by number of streamers who are part of them."""

    try:
        results = memgraph.execute_and_fetch(
            f"""MATCH (u:User)-[:IS_PART_OF]->(t:Team)
            RETURN t.name as team_name, COUNT(u) as number_of_members
            ORDER BY number_of_members DESC
            LIMIT {num_of_teams};"""
        )

        teams_list = list()
        members_list = list()

        for result in results:
            team_name = result["team_name"]
            num_of_members = result["number_of_members"]
            teams_list.append(team_name)
            members_list.append(num_of_members)

        teams = [{"name": team_name} for team_name in teams_list]
        members = [{"members": member_count} for member_count in members_list]

        response = {"teams": teams, "members": members}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top teams went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-vips/<num_of_vips>", methods=["GET"])
@log_time
def get_top_vips(num_of_vips):
    """Get top num_of_vips vips by number of streamers who gave them the vip badge."""

    try:
        results = memgraph.execute_and_fetch(
            f"""MATCH (u:User)<-[:VIP]-(v:User)
            RETURN v.name as vip_name, COUNT(u) as number_of_streamers
            ORDER BY number_of_streamers DESC
            LIMIT {num_of_vips};"""
        )

        vips_list = list()
        streamers_list = list()

        for result in results:
            vip_name = result["vip_name"]
            num_of_streamers = result["number_of_streamers"]
            vips_list.append(vip_name)
            streamers_list.append(num_of_streamers)

        vips = [{"name": vip_name} for vip_name in vips_list]
        streamers = [{"streamers": streamer_count} for streamer_count in streamers_list]
        response = {"vips": vips, "streamers": streamers}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top vips went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-moderators/<num_of_moderators>", methods=["GET"])
@log_time
def get_top_moderators(num_of_moderators):
    """Get top num_of_moderators moderators by number of streamers who gave them the moderator badge."""

    try:
        results = memgraph.execute_and_fetch(
            f"""MATCH (u:User)<-[:MODERATOR]-(m:User)
            RETURN m.name as moderator_name, COUNT(u) as number_of_streamers
            ORDER BY number_of_streamers DESC
            LIMIT {num_of_moderators};"""
        )

        moderators_list = list()
        streamers_list = list()

        for result in results:
            moderator_name = result["moderator_name"]
            num_of_streamers = result["number_of_streamers"]
            moderators_list.append(moderator_name)
            streamers_list.append(num_of_streamers)

        moderators = [{"name": moderator_name} for moderator_name in moderators_list]
        streamers = [{"streamers": streamer_count} for streamer_count in streamers_list]
        response = {"moderators": moderators, "streamers": streamers}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top moderators went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/streamer/<streamer_name>", methods=["GET"])
@log_time
def get_streamer(streamer_name):
    """Get info about streamer whose name is streamer_name."""
    try:
        counter = len(
            list(
                Match().node("User", "u").where("u.name", "=", streamer_name).execute()
            )
        )

        # If the streamer exists, return its relationships
        if counter != 0:

            results = list(
                Match()
                .node("User", variable="u")
                .to()
                .node(variable="n")
                .where("u.name", "=", streamer_name)
                .execute()
            )

            links_set = set()
            nodes_set = set()

            for result in results:
                source_id = result["u"].id
                source_name = result["u"].name
                source_label = "Stream"

                target_id = result["n"].name
                target_name = result["n"].name
                target_label = list(result["n"]._labels)[0]

                log.info(target_label)

                nodes_set.add((source_id, source_label, source_name))
                nodes_set.add((target_id, target_label, target_name))

                if (source_id, target_id) not in links_set and (
                    target_id,
                    source_id,
                ) not in links_set:
                    links_set.add((source_id, target_id))

            nodes = [
                {"id": node_id, "label": node_label, "name": node_name}
                for node_id, node_label, node_name in nodes_set
            ]
            links = [{"source": n_id, "target": m_id} for (n_id, m_id) in links_set]
        # If the streamer doesn't exist, return empty response
        else:
            nodes = []
            links = []

        response = {"nodes": nodes, "links": links}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching streamer by name went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/streamers/<language>/<game>", methods=["GET"])
@log_time
def get_streamers(language, game):
    """Get all streamers who stream certain game in certain language."""
    try:
        results = list(
            Match()
            .node("Stream", variable="s")
            .to("SPEAKS")
            .node("Language", variable="l")
            .where("l.name", "=", language)
            .match()
            .node(variable="s")
            .to("PLAYS")
            .node("Game", variable="g")
            .where("g.name", "=", game)
            .execute()
        )

        nodes_set = set()
        links_set = set()

        for result in results:
            streamer_id = result["s"].id
            streamer_name = result["s"].name
            streamer_label = "Stream"

            game_id = result["g"].name
            game_name = result["g"].name
            game_label = "Game"

            language_id = result["l"].name
            language_name = result["l"].name
            language_label = result["l"]._label

            nodes_set.add((streamer_id, streamer_name, streamer_label))
            nodes_set.add((game_id, game_name, game_label))
            nodes_set.add((language_id, language_name, language_label))

            if (streamer_id, game_id) not in links_set and (
                game_id,
                streamer_id,
            ) not in links_set:
                links_set.add((streamer_id, game_id))

            if (streamer_id, language_id) not in links_set and (
                language_id,
                streamer_id,
            ) not in links_set:
                links_set.add((streamer_id, language_id))

        nodes = [
            {"id": node_id, "name": node_name, "label": node_label}
            for node_id, node_name, node_label in nodes_set
        ]
        links = [{"source": n_id, "target": m_id} for (n_id, m_id) in links_set]

        response = {"nodes": nodes, "links": links}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Data fetching went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/streamers", methods=["GET"])
@log_time
def get_all_streamers_names():
    """Get the names of all streamers."""
    try:
        results = list(Match().node("Stream", variable="stream").execute())

        streamers_list = list()

        for result in results:
            streamer_name = result["stream"].name
            view_count = result["stream"].totalViewCount
            streamer = {
                "title": streamer_name,
                "description": "streamer",
                "image": "image",
                "price": str(view_count),
            }
            streamers_list.append(streamer)

        response = {"streamers": streamers_list}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top teams went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/games", methods=["GET"])
@log_time
def get_all_games_names():
    """Get the names of all games."""
    try:
        results = list(Match().node("Game", variable="game").execute())

        games_list = list()

        for result in results:
            game_name = result["game"].name
            game = {
                "title": game_name,
                "description": "game",
                "image": "image",
                "price": "0",
            }
            games_list.append(game)

        response = {"games": games_list}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top teams went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/languages", methods=["GET"])
@log_time
def get_all_languages_names():
    """Get the names of all languages."""
    try:
        results = list(Match().node("Language", variable="lang").execute())
        languages_list = list()

        for result in results:
            language_name = result["lang"].name
            language = {
                "title": language_name,
                "description": "language",
                "image": "image",
                "price": "0",
            }
            languages_list.append(language)

        response = {"languages": languages_list}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching all languages went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/nodes", methods=["GET"])
@log_time
def get_nodes():
    """Get the number of nodes in database."""
    try:
        num_of_nodes = len(list(Match().node(variable="node").execute()))

        response = {"nodes": num_of_nodes}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching number of nodes went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/edges", methods=["GET"])
@log_time
def get_edges():
    """Get the number of edges in database."""
    try:
        num_of_edges = len(list(Match().node().to(variable="r").node().execute()))

        response = {"edges": num_of_edges}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching number of nodes went wrong.")
        log.info(e)
        return ("", 500)


@log_time
def load_data():
    """Load data into the database."""

    if not args.populate:
        log.info("Data is loaded in Memgraph.")
        return
    log.info("Loading data into Memgraph.")
    try:
        memgraph.drop_database()
        load_twitch_data()
    except Exception as e:
        log.info("Data loading error.")


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


def connect_to_memgraph():
    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
        except:
            log.info("Memgraph probably isn't running.")
            time.sleep(4)


def main():
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        connect_to_memgraph()
        init_log()
        load_data()
    app.run(host=args.host, port=args.port, debug=args.debug)


if __name__ == "__main__":
    main()
