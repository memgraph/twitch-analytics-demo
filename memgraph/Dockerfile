FROM memgraph/memgraph-mage:1.1

USER root

# Copy the local query modules
COPY query_modules/twitch.py /usr/lib/memgraph/query_modules/twitch.py

USER memgraph