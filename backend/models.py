from app import memgraph
from gqlalchemy import Node, Field, Relationship


class User(Node):
    name: str = Field(index=True, unique=True, db=memgraph)


# TODO: stream = Stream(id=row[0]).load(db=memgraph) should work without default="" in other properties
class Stream(Node, labels={"User", "Stream"}):
    name: str = Field(index=True, unique=True, db=memgraph, label="User", default="")
    id: str = Field(index=True, unique=True, db=memgraph)
    url: str = Field(default="")
    followers: int = Field(default="")
    createdAt: str = Field(default="")
    totalViewCount: int = Field(default="")
    description: str = Field(default="")


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
