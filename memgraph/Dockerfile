FROM memgraph/memgraph-mage:1.01

USER root

# Copy the local query modules and data import files
COPY query_modules/twitch.py /usr/lib/memgraph/query_modules/twitch.py

USER memgraph