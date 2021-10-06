import time
import logging
from functools import wraps
from pathlib import Path

log = logging.getLogger(__name__)


def connect_to_memgraph(memgraph):
    connection_established = False
    while not connection_established:
        try:
            if memgraph._get_cached_connection().is_active():
                connection_established = True
        except:
            log.info("Memgraph probably isn't running.")
            time.sleep(4)


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
def load_twitch_data(memgraph):
    path_streams = Path("/usr/lib/memgraph/import-data/streamers.csv")
    path_teams = Path("/usr/lib/memgraph/import-data/teams.csv")
    path_vips = Path("/usr/lib/memgraph/import-data/vips.csv")
    path_moderators = Path("/usr/lib/memgraph/import-data/moderators.csv")
    path_chatters = Path("/usr/lib/memgraph/import-data/chatters.csv")

    memgraph.execute(
        f"""LOAD CSV FROM "{path_streams}"
            WITH HEADER DELIMITER "," AS row
            CREATE (u:User:Stream {{id: ToString(row.user_id), name: Tostring(row.user_name), 
            url: ToString(row.thumbnail_url), followers: ToInteger(row.followers), 
            createdAt: ToString(row.created_at), totalViewCount: ToInteger(row.view_count), 
            description: ToString(row.description)}})
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
