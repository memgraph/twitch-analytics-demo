import logging
import os
import time
from argparse import ArgumentParser
from flask import Flask, Response, render_template
from functools import wraps
from gqlalchemy import Match, Memgraph
from json import dumps
from pathlib import Path

log = logging.getLogger(__name__)

def init_log():
    logging.basicConfig(level=logging.DEBUG)
    log.info("Logging enabled")
    logging.getLogger("werkzeug").setLevel(logging.WARNING)

init_log()

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
        help="Run app with data loading."
    )
    parser.set_defaults(populate=False)
    log.info(__doc__)
    return parser.parse_args()


args = parse_args()

memgraph = Memgraph()
connection_established = False
while not connection_established:
    try:
        if memgraph._get_cached_connection().is_active():
            connection_established = True
    except:
        log.info("Memgraph probably isn't running.")
        time.sleep(4)

app = Flask(
    __name__,
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
        path_streams = Path("/usr/lib/memgraph/import-data/streamers.csv")
        path_teams = Path("/usr/lib/memgraph/import-data/teams.csv")
        path_vips = Path("/usr/lib/memgraph/import-data/vips.csv")
        path_moderators = Path("/usr/lib/memgraph/import-data/moderators.csv")
        path_chatters = Path("/usr/lib/memgraph/import-data/chatters.csv")

        memgraph.execute(
            f"""LOAD CSV FROM "{path_streams}"
            WITH HEADER DELIMITER "," AS row
            CREATE (u:User:Stream {{id: ToString(row.user_id), name: Tostring(row.user_name), url: ToString(row.thumbnail_url), followers: ToInteger(row.followers), createdAt: ToString(row.created_at), totalViewCount: ToInteger(row.view_count), description: ToString(row.description)}})
            MERGE (l:Language {{name: ToString(row.language)}})
            CREATE (u)-[:SPEAKS]->(l)
            MERGE (g:Game{{name: ToString(row.game_name)}})
            CREATE (u)-[:PLAYS]->(g);"""
        )

        memgraph.execute(
            f"""CREATE INDEX ON :User(id);"""
        )

        memgraph.execute(
            f"""CREATE INDEX ON :User(name);"""
        )

        memgraph.execute(
            f"""LOAD CSV FROM "{path_teams}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User:Stream)
            WHERE s.id = toString(row.user_id)
            MERGE (t:Team {{name: toString(row.team_name)}})
            CREATE (s)-[:IS_PART_OF]->(t);"""
        )

        memgraph.execute(
            f"""LOAD CSV FROM "{path_vips}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User:Stream)
            WHERE s.id = toString(row.user_id)
            MERGE (v:User {{name: toString(row.vip_login)}})
            CREATE (v)-[:VIP]->(s);"""
        )

        memgraph.execute(
            f"""LOAD CSV FROM "{path_moderators}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User:Stream)
            WHERE s.id = toString(row.user_id)
            MERGE(m:User {{name: toString(row.moderator_login)}})
            CREATE (m)-[:MODERATOR]->(s);"""
        )

        memgraph.execute(
            f"""LOAD CSV FROM "{path_chatters}"
            WITH HEADER DELIMITER "," AS row
            MATCH (s:User {{id: row.user_id}})
            MERGE (c:User {{name: row.chatter_login}})
            CREATE (c)-[:CHATTER]->(s);"""
        )

@app.route("/page-rank", methods=["GET"])
@log_time
def get_page_rank():
    """Call the Page rank procedure and return the results."""

    try:
        results = memgraph.execute_and_fetch(
            """CALL pagerank.get()
            YIELD node, rank; """ #sort in memgraph (order by)
        )

        page_rank_dict = dict()
        page_rank_list = list()

        for result in results:
            if(list(result["node"].labels)[0] == "User" or list(result["node"].labels)[0] == "Stream"):
                user_name = result["node"].properties["name"]
                rank = float(result["rank"])
                page_rank_dict = {"name": user_name, "rank": rank}
                dict_copy = page_rank_dict.copy()
                page_rank_list.append(dict_copy)

        sorted_list = sorted(page_rank_list, key = lambda i: i['rank'], reverse=True)
        top_50_list = sorted_list[0:50]
        response = {"page_rank" : top_50_list}

        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching users' ranks using pagerank went wrong.")
        log.info(e)
        return ("", 500)

@app.route("/betweenness-centrality", methods=["GET"])
@log_time
def get_bc():
    """Call the Betweenness centrality procedure and return the results."""

    try:
        results = memgraph.execute_and_fetch(
            """CALL betweenness_centrality.get()
            YIELD node, betweeenness_centrality;""" #sort in memgraph (order by)
        )

        bc_dict = dict()
        bc_list = list()

        for result in results:
            if(list(result["node"].labels)[0] == "User" or list(result["node"].labels)[0] == "Stream"):
                user_name = result["node"].properties["name"]
                bc = float(result["betweeenness_centrality"])
                bc_dict = {"name": user_name, "betweenness_centrality": bc}
                dict_copy = bc_dict.copy()
                bc_list.append(dict_copy)

        sorted_list = sorted(bc_list, key = lambda i: i['betweenness_centrality'], reverse=True)
        top_50_list = sorted_list[0:50]
        response = {"bc" : top_50_list}

        return Response(dumps(response), status=200, mimetype="application/json")

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
            streamer_name = result['streamer']
            total_views = result['total_view_count']
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
        return Response(dumps(response), status=200, mimetype="application/json")

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
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top streamers by followers went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-games/<num_of_games>", methods=["GET"])
@log_time
def get_top_games(num_of_games):
    """Get top _num_ games by number of streamers who play them."""

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
            game_name = result['game_name']
            num_of_players = result['number_of_players']
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
        return Response(dumps(response), status=200, mimetype="application/json")

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
            team_name = result['team_name']
            num_of_members = result['number_of_members']
            teams_list.append(team_name)
            members_list.append(num_of_members)

        teams = [
            {"name": team_name}
            for team_name in teams_list
        ]
        members = [
            {"members": member_count}
            for member_count in members_list
        ]

        response = {"teams": teams, "members": members}
        return Response(dumps(response), status=200, mimetype="application/json")

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
            vip_name = result['vip_name']
            num_of_streamers = result['number_of_streamers']
            vips_list.append(vip_name)
            streamers_list.append(num_of_streamers)

        vips = [
            {"name": vip_name}
            for vip_name in vips_list
        ]
        streamers = [
            {"streamers": streamer_count}
            for streamer_count in streamers_list
        ]
        response = {"vips": vips, "streamers": streamers}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top vips went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/top-moderators/<num_of_moderators>", methods=["GET"])
@log_time
def get_top_moderators(num_of_moderators):
    """Get top _num_of_moderators moderators by number of streamers who gave them the moderator badge."""

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
            moderator_name = result['moderator_name']
            num_of_streamers = result['number_of_streamers']
            moderators_list.append(moderator_name)
            streamers_list.append(num_of_streamers)

        moderators = [
            {"name": moderator_name}
            for moderator_name in moderators_list
        ]
        streamers = [
            {"streamers": streamer_count}
            for streamer_count in streamers_list
        ]
        response = {"moderators": moderators, "streamers": streamers}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top moderators went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/streamer/<streamer_name>", methods=["GET"])
@log_time
def get_streamer(streamer_name):
    """Get info about streamer whose name is streamer_name."""
    is_streamer = True
    try:
        # Check whether streamer with the given name exists
        counters = memgraph.execute_and_fetch(
            f"""MATCH (u:User {{name:"{streamer_name}"}})
            RETURN COUNT(u) AS name_counter;"""
        )

        for counter in counters:
            if(counter['name_counter'] == 0):
                is_streamer = False

        # If the streamer exists, return its relationships
        if(is_streamer):
            results = memgraph.execute_and_fetch(
                """MATCH (u:User {name:'""" + str(streamer_name) + """'})-[]->(n)
                RETURN u,n;"""
            )

            links_set = set()
            nodes_set = set()

            for result in results:
                source_id = result['u'].properties['id']
                source_name = result['u'].properties['name']
                source_label = 'Stream'

                target_id = result['n'].properties['name']
                target_name = result['n'].properties['name']
                target_label = list(result['n'].labels)[0]

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
        return Response(dumps(response), status=200, mimetype="application/json")



    except Exception as e:
        log.info("Fetching streamer by name went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/streamers/<language>/<game>", methods=["GET"])
@log_time
def get_streamers(language, game):
    """Get all streamers who stream certain game in certain language."""
    try:
        results = memgraph.execute_and_fetch(
            f"""MATCH(u:Stream)-[:SPEAKS]->(l:Language {{name: "{language}"}})
            MATCH (u)-[:PLAYS]->(g:Game {{name:"{game}"}})
            RETURN u,g,l;"""
        )

        nodes_set = set()
        links_set = set()

        for result in results:
            source_id = result['u'].properties['id']
            source_name = result['u'].properties['name']
            source_label = 'Stream'

            target_1_id = result['g'].properties['name']
            target_1_name = result['g'].properties['name']
            target_1_label = 'Game'

            target_2_id = result['l'].properties['name']
            target_2_name = result['l'].properties['name']
            target_2_label = 'Language'

            nodes_set.add((source_id, source_name, source_label))
            nodes_set.add((target_1_id, target_1_name, target_1_label))
            nodes_set.add((target_2_id, target_2_name, target_2_label))

            if (source_id, target_1_id) not in links_set and (
                    target_1_id,
                    source_id,
                ) not in links_set:
                    links_set.add((source_id, target_1_id))
            if (source_id, target_2_id) not in links_set and (
                    target_2_id,
                    source_id,
                ) not in links_set:
                    links_set.add((source_id, target_2_id))


        nodes = [
            {"id": node_id, "name": node_name, "label": node_label}
            for node_id, node_name, node_label in nodes_set
        ]
        links = [{"source": n_id, "target": m_id} for (n_id, m_id) in links_set]

        response = {"nodes": nodes, "links": links}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Data fetching went wrong.")
        log.info(e)
        return ("", 500)

@app.route("/streamers", methods=["GET"])
@log_time
def get_all_streamers_names():
    """Get the names of all streamers."""
    try:
        results = memgraph.execute_and_fetch(
            """MATCH (n:Stream)
                RETURN n.name AS streamer_name, n.totalViewCount AS view_count;"""
        )

        streamers_list = list()

        for result in results:
            streamer_name = result['streamer_name']
            view_count = result['view_count']
            streamer = {"title": streamer_name, "description": "streamer", "image": "image", "price": str(view_count)}
            streamers_list.append(streamer)

        response = {"streamers": streamers_list}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top teams went wrong.")
        log.info(e)
        return ("", 500)
 

@app.route("/games", methods=["GET"])
@log_time
def get_all_games_names():
    """Get the names of all games."""
    try:
        results = memgraph.execute_and_fetch(
            """MATCH(n:Game)
                RETURN n.name AS game_name;"""
        )

        games_list = list()

        for result in results:
            game_name = result['game_name']
            game = {"title": game_name, "description": "game", "image": "image", "price": "0"}
            games_list.append(game)

        response = {"games": games_list}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching top teams went wrong.")
        log.info(e)
        return ("", 500)

@app.route("/languages", methods=["GET"])
@log_time
def get_all_languages_names():
    """Get the names of all languages."""
    try:
        results = memgraph.execute_and_fetch(
            """MATCH(n:Language)
                RETURN n.name AS language_name;"""
        )

        languages_list = list()

        for result in results:
            language_name = result['language_name']
            language = {"title": language_name, "description": "language", "image": "image", "price": "0"}
            languages_list.append(language)

        response = {"languages": languages_list}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching all languages went wrong.")
        log.info(e)
        return ("", 500)

@app.route("/nodes", methods=["GET"])
@log_time
def get_nodes():
    """Get the number of nodes in database."""
    try:
        results = memgraph.execute_and_fetch(
            """MATCH ()
            RETURN count(*) AS nodes;"""
        )

        for result in results:
            num_of_nodes = result['nodes']

        response = {"nodes": num_of_nodes}
        return Response(dumps(response), status=200, mimetype="application/json")

    except Exception as e:
        log.info("Fetching number of nodes went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/edges", methods=["GET"])
@log_time
def get_edges():
    """Get the number of edges in database."""
    try:
        results = memgraph.execute_and_fetch(
            """MATCH (:Stream)-[]-()
            RETURN count(*) AS edges;"""
        )

        for result in results:
            num_of_edges = result['edges']

        response = {"edges": num_of_edges}
        return Response(dumps(response), status=200, mimetype="application/json")

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

def main():
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        load_data()
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    main()