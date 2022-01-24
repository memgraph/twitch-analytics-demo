from pathlib import Path
from csv import reader
import models
from app import memgraph
import traceback


def load_streams(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = models.Stream(
                    id=row[1],
                    name=row[3],
                    url=row[6],
                    followers=row[7],
                    createdAt=row[10],
                    totalViewCount=row[9],
                    description=row[8],
                ).save(memgraph)

                language = models.Language(name=row[5]).save(memgraph)
                game = models.Game(name=row[4]).save(memgraph)

                speaks_rel = models.Speaks(
                    _start_node_id=stream._id, _end_node_id=language._id
                ).save(memgraph)

                plays_rel = models.Plays(
                    _start_node_id=stream._id, _end_node_id=game._id
                ).save(memgraph)


def load_teams(path):
    try:
        with open(path) as read_obj:
            csv_reader = reader(read_obj)
            header = next(csv_reader)
            if header != None:
                for row in csv_reader:
                    stream = models.Stream(id=row[0]).load(db=memgraph)
                    team = models.Team(name=row[1]).save(memgraph)
                    is_part_of_rel = models.IsPartOf(
                        _start_node_id=stream._id, _end_node_id=team._id
                    ).save(memgraph)
    except Exception as e:
        traceback.print_exc()


def load_vips(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = models.Stream(id=row[0]).load(db=memgraph)
                vip = models.User(name=row[1]).save(memgraph)
                vip_rel = models.Vip(
                    _start_node_id=vip._id, _end_node_id=stream._id
                ).save(memgraph)


def load_moderators(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = models.Stream(id=row[0]).load(db=memgraph)
                moderator = models.User(name=row[1]).save(memgraph)
                moderator_rel = models.Moderator(
                    _start_node_id=moderator._id, _end_node_id=stream._id
                ).save(memgraph)


def load_chatters(path):
    with open(path) as read_obj:
        csv_reader = reader(read_obj)
        header = next(csv_reader)
        if header != None:
            for row in csv_reader:
                stream = models.Stream(id=row[0]).load(db=memgraph)
                chatter = models.User(name=row[1]).save(memgraph)
                chatter_rel = models.Chatter(
                    _start_node_id=chatter._id, _end_node_id=stream._id
                ).save(memgraph)


def load():
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
