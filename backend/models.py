from typing import Optional
from app import memgraph
from gqlalchemy import Node, Field, Relationship


class User(Node):
    name: str = Field(index=True, exists=True, unique=True, db=memgraph)


class Stream(User):
    name: Optional[str] = Field(
        index=True, exists=True, unique=True, db=memgraph, label="User"
    )
    id: str = Field(index=True, exists=True, unique=True, db=memgraph)
    url: Optional[str] = Field()
    followers: Optional[int] = Field()
    createdAt: Optional[str] = Field()
    totalViewCount: Optional[int] = Field()
    description: Optional[str] = Field()


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
