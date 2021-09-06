import mgp
import json


@mgp.transformation
def chatters(messages: mgp.Messages
             ) -> mgp.Record(query=str, parameters=mgp.Nullable[mgp.Map]):
    result_queries = []

    for i in range(messages.total_messages()):
        message = messages.message_at(i)
        comment_info = json.loads(message.payload().decode('utf8'))
        result_queries.append(
            mgp.Record(
                query=("MERGE (u:User:Stream {id: $user_id}) "
                       "MERGE (c:User {name: $chatter_login}) "
                       "CREATE (c)-[:CHATTER]->(u)"),
                parameters={
                    "user_id": comment_info["user_id"],
                    "chatter_login": comment_info["chatter_login"]}))

    return result_queries
