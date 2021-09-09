import json
import os
from argparse import ArgumentParser
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable
from time import sleep
import setup


KAFKA_IP = os.getenv('KAFKA_IP', 'kafka')
KAFKA_PORT = os.getenv('KAFKA_PORT', '9092')
MEMGRAPH_IP = os.getenv('MEMGRAPH_IP', 'memgraph-mage')
MEMGRAPH_PORT = os.getenv('MEMGRAPH_PORT', '7687')


def parse_args():
    """
    Parse input command line arguments.
    """
    parser = ArgumentParser(
        description="A Twitch stream machine powered by Memgraph.")
    parser.add_argument("--file", help="File with chatter data.")
    parser.add_argument(
        "--interval",
        type=int,
        help="Interval for sending data in seconds.")
    return parser.parse_args()


def create_kafka_producer():
    retries = 30
    while True:
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_IP + ':' + KAFKA_PORT)
            return producer
        except NoBrokersAvailable:
            retries -= 1
            if not retries:
                raise
            print("Failed to connect to Kafka")
            sleep(1)


def main():
    args = parse_args()

    memgraph = setup.connect_to_memgraph(MEMGRAPH_IP, MEMGRAPH_PORT)
    setup.run(memgraph, KAFKA_IP, KAFKA_PORT)

    producer = create_kafka_producer()
    with open(args.file) as f:
        for line in f.readlines():
            line_list = line.strip().split(",")
            line_json = {
                'user_id': line_list[0],
                'chatter_login': line_list[1]
            }

            print(f'Sending data to chatters')
            producer.send("chatters", json.dumps(line_json).encode('utf8'))
            sleep(args.interval)


if __name__ == "__main__":
    main()
