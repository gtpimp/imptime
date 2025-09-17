import time

import redis
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import OperationalError


class Command(BaseCommand):

    help = "Waits for a flag"

    def add_arguments(self, parser):
        parser.add_argument("flag_id", nargs="+", type=str)

    def can_connect(self):
        print("checking redis connection with settings:")
        print(settings.REDIS)
        try:
            r = redis.StrictRedis(
                host=settings.REDIS["HOST"],
                port=settings.REDIS["PORT"],
                db=settings.REDIS["DB"],
            )
        except OperationalError:
            return False
        else:
            return True

    def handle(self, **kwargs):
        while not self.can_connect():
            print(settings.REDIS)
            print("retrying in 5 seconds")
            time.sleep(5)
        print("redis available")
        r = redis.StrictRedis(
            host=settings.REDIS["HOST"],
            port=settings.REDIS["PORT"],
            db=settings.REDIS["DB"],
        )
        while not r.sismember("flags", kwargs["flag_id"][0]):
            print("waiting for flag " + ",".join(kwargs["flag_id"]))
            print("retrying in 5 seconds")
            time.sleep(5)
        print("flag " + ",".join(kwargs["flag_id"]) + " has been set")
