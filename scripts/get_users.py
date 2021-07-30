import twitch
import pandas as pd
import csv

client = twitch.TwitchHelix(client_id='ll6iwaioden39cwoo0u3x4y3m89e3x', oauth_token='b6yf8utpreemxtjc3cu0gc318nsk5d')
col_list = ["user_id"]
df = pd.read_csv("streams_file.csv", usecols = col_list)
user_ids = df.values.tolist()
print(user_ids)

dict_filter = lambda x, y: dict([ (i,x[i]) for i in x if i in set(y) ])
new_dict_keys = ("id", "description","view_count", "created_at")
users = client.get_users(ids=user_ids)

users_file = open('users_file.csv', 'w', encoding="utf-8")
csv_writer = csv.writer(users_file)
count = 0
for user in users:
    small_user = dict_filter(user, new_dict_keys)
    if count == 0:
        # Writing headers of CSV file
        header = small_user.keys()
        csv_writer.writerow(header)
        count += 1

    # Writing data of CSV file
    csv_writer.writerow(small_user.values())
    print("writing new stream")

users_file.close()