import shlex
import subprocess
import json
import pandas as pd
  
col_list = ["user_id"]
df = pd.read_csv("streams_file.csv", usecols = col_list)
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
with open('followers_file.csv', 'w', encoding="utf-8") as f:
    for key in followers.keys():
        if count == 0:
            f.write("user_id,followers\n")
            count +=1
        f.write("%s,%s\n"%(key,followers[key]))