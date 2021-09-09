FROM memgraph/memgraph-mage

USER root

# Install pip packages
#COPY requirements.txt ./
#RUN pip3 install -r requirements.txt

# Copy the local query modules and data import files
COPY query_modules/twitch.py /usr/lib/memgraph/query_modules/twitch.py

USER memgraph