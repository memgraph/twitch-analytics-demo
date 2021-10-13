from twitch.helix.api import TwitchHelix
import csv
import pandas as pd
import shlex
import subprocess
import json
import multiprocessing
import time
import collections
import itertools
import math
import sys


def get_streams(client):
    streams = client.get_streams()
    streams_file = open('streams.csv', 'w', encoding="utf-8", newline='')
    csv_writer = csv.writer(streams_file)
    count = 0

    def dict_filter(x, y): return dict([(i, x[i]) for i in x if i in set(y)])
    new_dict_keys = ("id", "user_id", "user_login", "user_name",
                     "game_name", "language", "thumbnail_url")

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


def get_users(client):
    col_list = ["user_id"]
    df = pd.read_csv("streams.csv", usecols=col_list)
    user_ids = df.values.tolist()
    print(user_ids)

    def dict_filter(x, y): return dict([(i, x[i]) for i in x if i in set(y)])
    new_dict_keys = ("id", "description", "view_count", "created_at")
    users = client.get_users(ids=user_ids)

    users_file = open('users.csv', 'w', encoding="utf-8", newline='')
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


def get_teams(my_client_id, my_oauth_token):
    col_list = ["user_id"]
    df = pd.read_csv("streams.csv", usecols=col_list)
    user_ids = df.values.tolist()
    all_teams = {}

    for user_id in user_ids:
        user_teams = []
        http_addr = "https://api.twitch.tv/helix/teams/channel?broadcaster_id=" + \
            str(user_id[0])
        print(http_addr)
        curl_command_line = '''curl -X GET ''' + http_addr + \
            ''' -H "Authorization: Bearer ''' + my_oauth_token + '''"''' + \
            ''' -H "Client-Id: ''' + my_client_id + '''"'''
        args = shlex.split(curl_command_line)
        subproc = subprocess.run(
            args, capture_output=True, text=True, encoding="utf-8").stdout
        if subproc is not None:
            data = json.loads(subproc)
            if data is not None:
                teams = data['data']
                if teams is not None:
                    for team in teams:
                        user_teams.append(team['team_name'])

        if not user_teams:
            all_teams[user_id[0]] = ""
        else:
            all_teams[user_id[0]] = user_teams

    # we have dictionary with user_id's as keys and list of the teams they belong to as values
    count = 0
    with open('teams.csv', 'w', encoding="utf-8", newline='') as f:
        for user_id in user_ids:
            if count == 0:
                f.write("user_id,team_name\n")
                count += 1
            for team in all_teams[user_id[0]]:
                f.write("%s,%s\n" % (user_id[0], team))


def get_followers(my_client_id, my_oauth_token):
    col_list = ["user_id"]
    df = pd.read_csv("streams.csv", usecols=col_list)
    user_ids = df.values.tolist()
    followers = dict()
    for user_id in user_ids:
        http_addr = "https://api.twitch.tv/helix/users/follows?to_id=" + \
            str(user_id[0])
        print(http_addr)
        curl_command_line = '''curl -X GET ''' + http_addr + \
            ''' -H "Authorization: Bearer ''' + my_oauth_token + '''"''' + \
            ''' -H "Client-Id: ''' + my_client_id + '''"'''
        args = shlex.split(curl_command_line)
        subproc = subprocess.run(
            args, capture_output=True, text=True, encoding="utf-8").stdout
        if subproc is not None:
            data = json.loads(subproc)
            if data['total'] is not None:
                num_of_follows = data['total']
                followers[str(user_id[0])] = num_of_follows

    count = 0
    with open('followers.csv', 'w', encoding="utf-8", newline='') as f:
        for key in followers.keys():
            if count == 0:
                f.write("user_id,followers\n")
                count += 1
            f.write("%s,%s\n" % (key, followers[key]))


def get_chatters(my_client_id, my_oauth_token):
    col_list = ["user_id", "user_login"]
    df = pd.read_csv("streams.csv", usecols=col_list)
    user_logins = df.values.tolist()
    with open('moderators.csv', 'w', encoding="utf-8", newline='') as m:
        with open('vips.csv', 'w', encoding="utf-8", newline='') as v:
            with open('full_chatters.csv', 'w', encoding="utf-8", newline='') as c:
                m.write("user_id,moderator_login\n")
                v.write("user_id,vip_login\n")
                c.write("user_id,chatter_login\n")
                for user_login in user_logins:
                    http_addr = "http://tmi.twitch.tv/group/user/" + \
                        user_login[1] + \
                        "/chatters"  # user_login[1] is user_login
                    print(http_addr)
                    curl_command_line = '''curl -X GET ''' + http_addr + \
                        ''' -H "Authorization: Bearer ''' + my_oauth_token + '''"''' + \
                        ''' -H "Client-Id: ''' + my_client_id + '''"'''
                    args = shlex.split(curl_command_line)
                    data = json.loads(subprocess.run(
                        args, capture_output=True, text=True).stdout)
                    # for every user fill three csvs - vips, moderators, viewers
                    moderators = data['chatters']['moderators']
                    vips = data['chatters']['vips']
                    chatters = data['chatters']['viewers']
                    for moderator in moderators:
                        # user_login[0] is user_id
                        m.write("%s,%s\n" % (user_login[0], moderator))
                    for vip in vips:
                        v.write("%s,%s\n" % (user_login[0], vip))
                    for chatter in chatters:
                        c.write("%s,%s\n" % (user_login[0], chatter))


def make_streamers_csv():
    csv_input_1 = pd.read_csv('streams.csv')
    csv_input_2 = pd.read_csv('followers.csv')
    csv_input_3 = pd.read_csv('users.csv')
    csv_input_1['followers'] = csv_input_2['followers']
    csv_input_1['description'] = csv_input_3['description']
    csv_input_1['view_count'] = csv_input_3['view_count']
    csv_input_1['created_at'] = csv_input_3['created_at']
    csv_input_1.to_csv('streamers.csv', index=False)


def count_by_id():
    with open("full_chatters.csv", encoding="utf-8", newline='') as csvfile:
        counter = collections.Counter(row["user_id"]
                                      for row in csv.DictReader(csvfile))

    with open("num_of_chatters.csv", "w", encoding="utf-8", newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(("user_id", "num_of_chatters"))
        for id, count in counter.items():
            writer.writerow((id, count))


def copy_rows():
    file_in = 'full_chatters.csv'
    file_out = 'chatters.csv'

    col_list = ["num_of_chatters"]
    df = pd.read_csv("num_of_chatters.csv", usecols=col_list)
    num_of_chatters = df.values.tolist()
    with open(file_in, "r", encoding="utf-8", newline='') as f_input, \
            open(file_out, "w", encoding="utf-8", newline='') as f_output:
        # write header
        line = f_input.readline()
        f_output.write(line)
        for count in num_of_chatters:
            start = 1
            ten_percent = math.floor(count[0] / 10)
            line = f_input.readline()
            # append ten percent of chatters for that streamer
            while start != ten_percent:
                f_output.write(line)
                print("writing line")
                start += 1
                line = f_input.readline()
            # read chatters for that streamer
            while start != count[0]:
                print("reading line")
                line = f_input.readline()
                start += 1


def main(my_client_id, my_oauth_token):
    client = TwitchHelix(client_id=my_client_id,
                         oauth_token=my_oauth_token)
    p = multiprocessing.Process(
        target=get_streams, name="Get_streams", args=(client,))
    p.start()
    time.sleep(2)  # number of streams must be max 100 for other calls to work
    if p.is_alive():
        p.terminate()
        p.join()
    get_users(client)
    get_teams(my_client_id, my_oauth_token)
    get_followers(my_client_id, my_oauth_token)
    get_chatters(my_client_id, my_oauth_token)
    make_streamers_csv()
    count_by_id()
    copy_rows()


# run script with: python scraper.py <client_id> <client_secret>
if __name__ == "__main__":
    my_client_id = str(sys.argv[1])
    my_oauth_token = str(sys.argv[2])
    main(my_client_id, my_oauth_token)
