from django.core.management.base import BaseCommand
from implicitdesign.views import render_staff_daylies


class Command(BaseCommand):
    args = ""

    help = """Displays the daily hourly totals for the last few weeks"""

    def handle(self, *args, **options):
        template = "staff_daylies.txt"
        print(render_staff_daylies(template=template).content)
