import logging
from argparse import ArgumentParser
from gqlalchemy import Match, Memgraph
import time
from functools import wraps
from flask import Flask, Response, render_template 
from pathlib import Path
import json

from werkzeug.wrappers import response

log = logging.getLogger(__name__)


def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")
    logging.getLogger("werkzeug").setLevel(logging.WARNING)

init_log()

def parse_args():
    """
    Parse command line arguments.
    """
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0", help="Host address.")
    parser.add_argument("--port", default=5000, type=int, help="App port.")
    parser.add_argument(
        "--template-folder",
        default="public/template",
        help="Path to the directory with flask templates.",
    ) 
    parser.add_argument(
        "--static-folder",
        default="public",
        help="Path to the directory with flask static files.",
    )
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
    )
    parser.add_argument(
        "--no-populate",
        dest="populate",
        action="store_false",
    )
    parser.set_defaults(populate=True)
    #print(__doc__)
    return parser.parse_args()


args = parse_args()
print("POPULATE:" + str(args.populate))

memgraph = Memgraph()
connection_established = False
while(not connection_established):
    try:
        if (memgraph._get_cached_connection().is_active()):  
            connection_established = True
    except:
        log.info("Memgraph probably isn't running.")
        time.sleep(4)
 
app = Flask(
    __name__,
    template_folder=args.template_folder,
    static_folder=args.static_folder, 
    static_url_path="",
)

def log_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start_time
        log.info(f"Time for {func.__name__} is {duration}")
        return result
    return wrapper

@log_time
def load_twitch_data():
        path_streams = Path("/usr/lib/memgraph/import-data/streams.csv")
        path_teams = Path("/usr/lib/memgraph/import-data/teams.csv")
        path_vips = Path("/usr/lib/memgraph/import-data/vips.csv")
        path_moderators = Path("/usr/lib/memgraph/import-data/moderators.csv")

        memgraph.execute_query(
            f"""LOAD CSV FROM "{path_streams}"
            WITH HEADER DELIMITER "," AS row
            CREATE (u:User:Stream {{id: ToString(row.id), name: Tostring(row.name), followers: ToInteger(row.followers), createdAt: ToString(row.createdAt), totalViewCount: ToInteger(row.totalViewCount), description: ToString(row.description)}}) 
            MERGE (l:Language {{name: ToString(row.language)}})
            CREATE (u)-[:SPEAKS]->(l)
            MERGE (g:Game{{name: ToString(row.game_name)}})
            CREATE (u)-[:PLAYS]->(g);"""
        )

        memgraph.execute_query(
            f"""LOAD CSV FROM "{path_teams}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User:Stream)
            WHERE s.id = toString(row.user_id)
            MERGE (t:Team {{name: toString(row.team_name)}})
            CREATE (s)-[:IS_PART_OF]->(t);"""
        )
        
        memgraph.execute_query(
            f"""LOAD CSV FROM "{path_vips}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User:Stream)
            WHERE s.id = toString(row.user_id)
            MERGE (v:User {{name: toString(row.vip_login)}})
            CREATE (v)-[:VIP]->(s);"""
        )

        memgraph.execute_query(
            f"""LOAD CSV FROM "{path_moderators}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User:Stream)
            WHERE s.id = toString(row.user_id)
            MERGE(m:User {{name: toString(row.moderator_login)}})
            CREATE (m)-[:MODERATOR]->(s);"""
        )

@app.route("/load-data", methods=["GET"])
@log_time
def load_data():
    """Load data into the database."""
    if args.populate:
        print("LOADING DATA INTO MEMGRAPH")
        try:
            memgraph.drop_database()      
            load_twitch_data()
            return Response(status=200)
        except Exception as e:
            log.info("Data loading error.")
            log.info(e) 
            return Response(status=500)
    else:
        print("DATA IS ALREADY LOADED")
        return Response(status=200)



@app.route("/get-graph", methods=["GET"])
@log_time
def get_data():
    """Load everything from the database."""

    try: 
        results = (
            Match()
            .node("User", variable="from")
            .to("IS_PART_OF")
            .node("Team", variable="to")
            .execute()
        ) 

        nodes_set = set()
        links_set = set()

        for result in results:
            source_id = result["from"].properties['id']
            target_id = result["to"].properties['name']
            source_label = list(result["from"].labels)[0] # can be User or Stream
            target_label = list(result["to"].labels)[0]

            nodes_set.add((source_id, source_label)) 
            nodes_set.add((target_id, target_label))

            if (source_id, target_id) not in links_set and (
                target_id,
                source_id,  
            ) not in links_set:
                links_set.add((source_id, target_id))  
 
        nodes = [
            {"id": node_id, "label": node_label}
            for node_id, node_label in nodes_set
        ]
        links = [{"source": n_id, "target": m_id} for (n_id, m_id) in links_set]

        response = {"nodes": nodes, "links": links}

        return Response(json.dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Data fetching went wrong.")
        log.info(e)
        return ("", 500) 


@app.route("/get-top-streamers-by-views/<num_of_streamers>", methods=["GET"])
@log_time
def get_top_streamers_by_views(num_of_streamers):
    """Get top _num_ streamers by total number of views."""

    try:
        results = memgraph.execute_and_fetch(
            """MATCH(u:Stream)
            RETURN u.name as streamer, u.totalViewCount as total_view_count
            ORDER BY total_view_count DESC
            LIMIT """ + str(num_of_streamers) + """;"""
        )

        streamers_list = list()
        views_list = list()

        for result in results:
            streamer_name = result['streamer']
            total_views = result['total_view_count']
            print(streamer_name)
            print(total_views)
            streamers_list.append(streamer_name)
            views_list.append(total_views)

        streamers = [
            {"name": streamer_name}
            for streamer_name in streamers_list
        ]
        views = [
            {"views": view_count}
            for view_count in views_list
        ]
        response = {"streamers": streamers, "views": views}
        return Response(json.dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top streamers by views went wrong.")
        log.info(e)
        return ("", 500) 


@app.route("/get-top-streamers-by-followers/<num_of_streamers>", methods=["GET"])
@log_time
def get_top_streamers_by_followers(num_of_streamers):
    """Get top _num_ streamers by total number of followers."""

    try:
        results = memgraph.execute_and_fetch(
            """MATCH(u:Stream)
            RETURN u.name as streamer, u.followers as num_of_followers
            ORDER BY num_of_followers DESC
            LIMIT """ + str(num_of_streamers) + """;"""
        )
        streamers_list = list()
        followers_list = list()
        for result in results: 
            streamer_name = result['streamer']
            num_of_followers = result['num_of_followers']
            streamers_list.append(streamer_name) 
            followers_list.append(num_of_followers)
        streamers = [
            {"name": streamer_name} 
            for streamer_name in streamers_list
        ] 
        followers = [
            {"followers": follower_count}
            for follower_count in followers_list
        ]
        response = {"streamers": streamers, "followers": followers}
        return Response(json.dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top streamers by followers went wrong.")
        log.info(e) 
        return ("", 500)


@app.route("/get-top-games/<num_of_games>", methods=["GET"])
@log_time
def get_top_games(num_of_games):
    """Get top _num_ games by number of streamers who play them."""

    try:
        results = memgraph.execute_and_fetch(
            """MATCH (u:User)-[:PLAYS]->(g:Game)
            RETURN g.name as game_name, COUNT(u) as number_of_players
            ORDER BY number_of_players DESC
            LIMIT """ + str(num_of_games) + """;"""
        )

        games_list = list()
        players_list = list()

        for result in results:
            game_name = result['game_name']
            num_of_players = result['number_of_players']
            print(game_name)
            print(num_of_players)
            games_list.append(game_name)
            players_list.append(num_of_players)

        games = [
            {"name": game_name}
            for game_name in games_list
        ]
        players = [
            {"players": player_count}
            for player_count in players_list
        ]
        response = {"games": games, "players": players}
        return Response(json.dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top games went wrong.")
        log.info(e)
        return ("", 500) 
 
@app.route("/", methods=["GET"])  
def index():
    return render_template("index.html")


def main():
    app.run(host=args.host, port=args.port, debug=args.debug)


if __name__ == "__main__":
    main()  