import shlex
import subprocess
import json
import pandas as pd

col_list = ["user_id", "user_login"]
df = pd.read_csv("streams_file.csv", usecols = col_list)
user_logins = df.values.tolist()
with open('moderators_file.csv', 'w', encoding="utf-8") as m:
    with open('vips_file.csv', 'w', encoding="utf-8") as v:
        with open('chatters_file.csv', 'w', encoding="utf-8") as c:
            m.write("user_id,moderator_login\n")
            v.write("user_id,vip_login\n")
            c.write("user_id,chatter_login\n")
            for user_login in user_logins:
                http_addr = "http://tmi.twitch.tv/group/user/" + user_login[1] + "/chatters" #user_login[1] is user_login
                print(http_addr)
                curl_command_line = '''curl -X GET ''' + http_addr + '''token and id (secret)'''
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

            