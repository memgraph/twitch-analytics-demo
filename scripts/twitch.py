import twitch
import csv
import pandas as pd
import shlex
import subprocess
import json
import multiprocessing
import time

def get_streams(client):
    streams = client.get_streams()
    print(len(streams))

    streams_file = open('streams_2.csv', 'w', encoding="utf-8", newline='')
    csv_writer = csv.writer(streams_file)
    count = 0

    dict_filter = lambda x, y: dict([ (i,x[i]) for i in x if i in set(y) ])
    new_dict_keys = ("id","user_id", "user_login", "user_name", "game_name", "language", "thumbnail_url")

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
    df = pd.read_csv("streams_2.csv", usecols = col_list)
    user_ids = df.values.tolist()
    print(user_ids)

    dict_filter = lambda x, y: dict([ (i,x[i]) for i in x if i in set(y) ])
    new_dict_keys = ("id", "description","view_count", "created_at")
    users = client.get_users(ids=user_ids)

    users_file = open('users_2.csv', 'w', encoding="utf-8", newline='')
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

def get_teams():
    col_list = ["user_id"]
    df = pd.read_csv("streams_2.csv", usecols = col_list)
    user_ids = df.values.tolist()
    all_teams = {}

    for user_id in user_ids:
        user_teams = []
        http_addr = "https://api.twitch.tv/helix/teams/channel?broadcaster_id=" + str(user_id[0])
        print(http_addr)
        curl_command_line = '''curl -X GET ''' + http_addr + ''' -H "Authorization: Bearer b6yf8utpreemxtjc3cu0gc318nsk5d" -H "Client-Id: ll6iwaioden39cwoo0u3x4y3m89e3x"'''
        args = shlex.split(curl_command_line)
        subproc = subprocess.run(args, capture_output=True, text=True, encoding="utf-8").stdout
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
    with open('teams_2.csv', 'w', encoding="utf-8", newline='') as f:
        for user_id in user_ids:
            if count == 0:
                f.write("user_id,team_name\n")
                count +=1
            for team in all_teams[user_id[0]]:
                f.write("%s,%s\n"%(user_id[0], team))

def get_followers():
    col_list = ["user_id"]
    df = pd.read_csv("streams_2.csv", usecols = col_list)
    user_ids = df.values.tolist()
    followers = dict()
    for user_id in user_ids:
        http_addr = "https://api.twitch.tv/helix/users/follows?to_id=" + str(user_id[0])
        print(http_addr)
        curl_command_line = '''curl -X GET ''' + http_addr + ''' -H "Authorization: Bearer b6yf8utpreemxtjc3cu0gc318nsk5d" -H "Client-Id: ll6iwaioden39cwoo0u3x4y3m89e3x"'''
        args = shlex.split(curl_command_line)
        subproc = subprocess.run(args, capture_output=True, text=True, encoding="utf-8").stdout
        if subproc is not None:
            data = json.loads(subproc)
            if data['total'] is not None:
                num_of_follows = data['total']
                followers[str(user_id[0])] = num_of_follows

    count = 0
    with open('followers_2.csv', 'w', encoding="utf-8", newline='') as f:
        for key in followers.keys():
            if count == 0:
                f.write("user_id,followers\n")
                count +=1
            f.write("%s,%s\n"%(key,followers[key]))

def get_chatters():
    col_list = ["user_id", "user_login"]
    df = pd.read_csv("streams_2.csv", usecols = col_list)
    user_logins = df.values.tolist()
    with open('moderators_2.csv', 'w', encoding="utf-8", newline='') as m:
        with open('vips_2.csv', 'w', encoding="utf-8", newline='') as v:
            with open('chatters_2.csv', 'w', encoding="utf-8", newline='') as c:
                m.write("user_id,moderator_login\n")
                v.write("user_id,vip_login\n")
                c.write("user_id,chatter_login\n")
                for user_login in user_logins:
                    http_addr = "http://tmi.twitch.tv/group/user/" + user_login[1] + "/chatters" #user_login[1] is user_login
                    print(http_addr)
                    curl_command_line = '''curl -X GET ''' + http_addr + ''' -H "Authorization: Bearer b6yf8utpreemxtjc3cu0gc318nsk5d" -H "Client-Id: ll6iwaioden39cwoo0u3x4y3m89e3x"'''
                    args = shlex.split(curl_command_line)
                    data = json.loads(subprocess.run(args, capture_output=True, text=True).stdout)
                    # for every user fill three csvs - vips, moderators, viewers 
                    moderators = data['chatters']['moderators']
                    vips = data['chatters']['vips']
                    chatters = data['chatters']['viewers']
                    for moderator in moderators:
                        m.write("%s,%s\n"%(user_login[0], moderator)) #user_login[0] is user_id
                    for vip in vips:
                        v.write("%s,%s\n"%(user_login[0], vip)) 
                    for chatter in chatters:
                        c.write("%s,%s\n"%(user_login[0], chatter)) 

def make_streamers_csv():
    csv_input_1 = pd.read_csv('streams_2.csv')
    csv_input_2 = pd.read_csv('followers_2.csv')
    csv_input_3 = pd.read_csv('users_2.csv')
    csv_input_1['followers'] = csv_input_2['followers']
    csv_input_1['description'] = csv_input_3['description']
    csv_input_1['view_count'] = csv_input_3['view_count']
    csv_input_1['created_at'] = csv_input_3['created_at']
    csv_input_1.to_csv('streamers_2.csv', index=False)

def main():
    # client = twitch.TwitchHelix(client_id='ll6iwaioden39cwoo0u3x4y3m89e3x', oauth_token='b6yf8utpreemxtjc3cu0gc318nsk5d')
    # p = multiprocessing.Process(target=get_streams, name="Get_streams", args=(client,))
    # p.start()
    # time.sleep(3) # num of streamers must be max 100 foreach user request
    # if p.is_alive():
    #     p.terminate()
    #     p.join()
    # get_users(client)
    # get_teams()
    # get_followers()
    # get_chatters()
    make_streamers_csv()

if __name__ == "__main__":
    main()
