import requests
import shlex
import subprocess
import json
  
curl_command_line = '''curl -X GET "https://api.twitch.tv/helix/games/top" -H "Authorization: Bearer b6yf8utpreemxtjc3cu0gc318nsk5d" -H "Client-Id: ll6iwaioden39cwoo0u3x4y3m89e3x"'''

args = shlex.split(curl_command_line)
data = json.loads(subprocess.run(args, capture_output=True, text=True).stdout)


print(len(data['data']))

id = data['data'][0]['id']
name = data['data'][0]['name']
url = data['data'][0]['box_art_url']
  
# printing the output
print("Id:%s\nName:%s\nUrl:%s"
      %(id, name, url))