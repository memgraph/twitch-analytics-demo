import twitch
import csv

client = twitch.TwitchHelix(clientid,token(secret))
streams = client.get_streams()
print(len(streams))

streams_file = open('streams_file.csv', 'w', encoding="utf-8")
csv_writer = csv.writer(streams_file)
count = 0

dict_filter = lambda x, y: dict([ (i,x[i]) for i in x if i in set(y) ])
new_dict_keys = ("id","user_id", "user_login", "user_name", "game_id", "game_name", "language")

for stream in streams:
    small_stream = dict_filter(stream, new_dict_keys)
    if count == 0:
        # Writing headers of CSV file
        header = small_stream.keys()
        csv_writer.writerow(header)
        count += 1

    # Writing data of CSV file
    csv_writer.writerow(small_stream.values())
    print("writing new stream")

streams_file.close()



