import shlex
import subprocess
import json
import pandas as pd
  
col_list = ["user_id"]
df = pd.read_csv("streams_file.csv", usecols = col_list)
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
with open('teams_file.csv', 'w', encoding="utf-8") as f:
    for user_id in user_ids:
        if count == 0:
            f.write("user_id,team_name\n")
            count +=1
        for team in all_teams[user_id[0]]:
            f.write("%s,%s\n"%(user_id[0], team))

                
            