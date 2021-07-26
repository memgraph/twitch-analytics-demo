import logging
from argparse import ArgumentParser
from gqlalchemy import Match, Memgraph
import time
from functools import wraps
from flask import Flask, Response, render_template 
from pathlib import Path
import json

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
    print(__doc__)
    return parser.parse_args()


args = parse_args()

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


@app.route("/load-data", methods=["GET"])
@log_time
def load_data():
    """Load data into the database."""

    try:
        memgraph.drop_database()
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
        return Response(status=200)
    except Exception as e:
        log.info("Data loading error.")
        log.info(e)
        return Response(status=500)



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

        # Set for quickly check if we have already added the node or the edge
        nodes_set = set()
        links_set = set()
        for result in results:
            source_id = result["from"].properties['id']
            target_id = result["to"].properties['name']

            nodes_set.add(source_id)
            nodes_set.add(target_id)

            if (source_id, target_id) not in links_set and (
                target_id,
                source_id,
            ) not in links_set:
                links_set.add((source_id, target_id))

        nodes = [
            {"id": node_id}
            for node_id in nodes_set
        ]
        links = [{"source": n_id, "target": m_id} for (n_id, m_id) in links_set]

        response = {"nodes": nodes, "links": links}

        return Response(json.dumps(response), status=200, mimetype="application/json")
    except Exception as e:
        log.info("Data fetching went wrong.")
        log.info(e)
        return ("", 500)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


def main():
    app.run(host=args.host, port=args.port, debug=args.debug)


if __name__ == "__main__":
    main()