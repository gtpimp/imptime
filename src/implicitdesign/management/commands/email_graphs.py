from django.core.management.base import BaseCommand
from implicitdesign.views import render_staff_daylies
from optparse import OptionParser, make_option
import datetime
from dateutil.relativedelta import relativedelta
try:
    from django.utils import timezone
except ImportError:
    from timepiece import timezone
from implicitdesign import graphs

class Command(BaseCommand):

    help = '''Creates graphs of times for a staff and emails it to the given addresses '''

    option_list = BaseCommand.option_list + (
        make_option('--username',
                    dest='username',
                    default=None,
            help='Username to generate the graph for'), 
        make_option('--test',
                    dest='test',
                    default=None,
            help='If 1, then don''t send to the user, only the admin users'), )

    def handle(self, *args, **kwargs):
        username = kwargs.get("username")
        to_date = datetime.date.today()
        from_date = to_date-relativedelta(days=30)
        graphs.daily_graph(username=username, from_date=from_date, to_date=to_date, test=(int(kwargs.get('test'))==1))
