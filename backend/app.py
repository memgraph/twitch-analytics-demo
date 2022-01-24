from argparse import ArgumentParser
from flask import Flask, Response, render_template
from gqlalchemy import Memgraph, Match, Call
from json import dumps
import logging
import os
import time
from functools import wraps
import traceback
import twitch_data

memgraph = Memgraph()

log = logging.getLogger(__name__)
app = Flask(
    __name__,
)
args = None


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


@app.route("/page-rank", methods=["GET"])
@log_time
def get_page_rank():
    """Call the Page rank procedure and return top 50 in descending order."""

    try:
        results = list(
            Call("pagerank.get")
            .yield_()
            .with_({"node": "node", "rank": "rank"})
            .add_custom_cypher("WHERE node:Stream OR node:User")
            .return_({"node.name": "node_name", "rank": "rank"})
            .order_by("rank DESC")
            .limit(50)
            .execute()
        )

        page_rank_dict = dict()
        page_rank_list = list()

        for result in results:
            user_name = result["node_name"]
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
        results = list(
            Call("betweenness_centrality.get")
            .yield_()
            .with_({"node": "node", "betweenness_centrality": "betweenness_centrality"})
            .add_custom_cypher("WHERE node:Stream OR node:User")
            .return_({"node.name": "node_name", "betweenness_centrality": "bc"})
            .order_by("bc DESC")
            .limit(50)
            .execute()
        )

        bc_dict = dict()
        bc_list = list()

        for result in results:
            user_name = result["node_name"]
            bc = float(result["bc"])
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

        results = list(
            Match()
            .node("Stream", variable="s")
            .return_(
                {"s.name": "streamer_name", "s.totalViewCount": "total_view_count"}
            )
            .order_by("total_view_count DESC")
            .limit(num_of_streamers)
            .execute()
        )

        streamers_list = list()
        views_list = list()

        for result in results:
            streamer_name = result["streamer_name"]
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

        results = list(
            Match()
            .node("Stream", variable="s")
            .return_({"s.name": "streamer_name", "s.followers": "num_of_followers"})
            .order_by("num_of_followers DESC")
            .limit(num_of_streamers)
            .execute()
        )

        streamers_list = list()
        followers_list = list()

        for result in results:
            streamer_name = result["streamer_name"]
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

        results = list(
            Match()
            .node("User", variable="u")
            .to("PLAYS")
            .node("Game", variable="g")
            .return_({"g.name": "game_name", "count(u)": "num_of_players"})
            .order_by("num_of_players DESC")
            .limit(num_of_games)
            .execute()
        )

        games_list = list()
        players_list = list()

        for result in results:
            game_name = result["game_name"]
            num_of_players = result["num_of_players"]
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

        results = list(
            Match()
            .node("User", variable="u")
            .to("IS_PART_OF")
            .node("Team", variable="t")
            .return_({"t.name": "team_name", "count(u)": "num_of_members"})
            .order_by("num_of_members DESC")
            .limit(num_of_teams)
            .execute()
        )

        teams_list = list()
        members_list = list()

        for result in results:
            team_name = result["team_name"]
            num_of_members = result["num_of_members"]
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

        results = list(
            Match()
            .node("User", variable="u")
            .from_("VIP")
            .node("User", variable="v")
            .return_({"v.name": "vip_name", "count(u)": "num_of_streamers"})
            .order_by("num_of_streamers DESC")
            .limit(num_of_vips)
            .execute()
        )

        vips_list = list()
        streamers_list = list()

        for result in results:
            vip_name = result["vip_name"]
            num_of_streamers = result["num_of_streamers"]
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

        results = list(
            Match()
            .node("User", variable="u")
            .from_("MODERATOR")
            .node("User", variable="m")
            .return_({"m.name": "moderator_name", "count(u)": "num_of_streamers"})
            .order_by("num_of_streamers DESC")
            .limit(num_of_moderators)
            .execute()
        )

        moderators_list = list()
        streamers_list = list()

        for result in results:
            moderator_name = result["moderator_name"]
            num_of_streamers = result["num_of_streamers"]
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
        counter = next(
            Match()
            .node("User", "u")
            .where("u.name", "=", streamer_name)
            .return_({"count(u)": "num_of_streamers"})
            .execute()
        )["num_of_streamers"]

        # If the streamer exists, return its relationships
        if counter != 0:

            results = list(
                Match()
                .node("User", variable="u")
                .to()
                .node(variable="n")
                .where("u.name", "=", streamer_name)
                .return_(
                    {
                        "u.id": "streamer_id",
                        "u.name": "streamer_name",
                        "n.name": "node_name",
                        "labels(n)": "labels",
                    }
                )
                .execute()
            )

            links_set = set()
            nodes_set = set()

            for result in results:
                if result["labels"][0] != "Stream" and result["labels"][0] != "User":
                    source_id = result["streamer_id"]
                    source_name = result["streamer_name"]
                    source_label = "Stream"

                    target_id = result["node_name"]
                    target_name = result["node_name"]
                    target_label = result["labels"][0]

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
            .return_(
                {
                    "s.id": "streamer_id",
                    "s.name": "streamer_name",
                    "g.name": "game_name",
                    "l.name": "language_name",
                }
            )
            .execute()
        )

        nodes_set = set()
        links_set = set()

        for result in results:
            streamer_id = result["streamer_id"]
            streamer_name = result["streamer_name"]
            streamer_label = "Stream"

            game_id = result["game_name"]
            game_name = result["game_name"]
            game_label = "Game"

            language_id = result["language_name"]
            language_name = result["language_name"]
            language_label = "Language"

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
        results = list(
            Match()
            .node("Stream", variable="stream")
            .return_({"stream.name": "streamer_name"})
            .execute()
        )

        streamers_list = list()

        for result in results:
            streamer_name = result["streamer_name"]
            streamer = {
                "title": streamer_name,
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
        results = list(
            Match()
            .node("Game", variable="game")
            .return_({"game.name": "name"})
            .execute()
        )

        games_list = list()

        for result in results:
            game = {"title": result["name"]}
            games_list.append(game)

        response = {"games": games_list}
        return Response(
            response=dumps(response), status=200, mimetype="application/json"
        )

    except Exception as e:
        log.info("Fetching top teams went wrong.")
        log.info(e)
        traceback.print_exc()
        return ("", 500)


@app.route("/languages", methods=["GET"])
@log_time
def get_all_languages_names():
    """Get the names of all languages."""
    try:
        results = list(
            Match()
            .node("Language", variable="lang")
            .return_({"lang.name": "name"})
            .execute()
        )
        languages_list = list()

        for result in results:
            language = {"title": result["name"]}
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
        num_of_nodes = next(
            Match()
            .node(variable="node")
            .return_({"count(node)": "num_of_nodes"})
            .execute()
        )["num_of_nodes"]

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
        num_of_edges = next(
            Match()
            .node()
            .to(variable="r")
            .node()
            .return_({"count(r)": "num_of_edges"})
            .execute()
        )["num_of_edges"]

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
        twitch_data.load()
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
    global args
    args = parse_args()
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        init_log()
        connect_to_memgraph()
        load_data()
    app.run(host=args.host, port=args.port, debug=args.debug)


if __name__ == "__main__":
    main()
