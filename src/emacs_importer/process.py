import sys
import os
import json
import copy
import calendar
from datetime import *
from dateutil.relativedelta import relativedelta
import calendar
import csv
import subprocess
import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.mime.image import MIMEImage
from email.MIMEText import MIMEText
from email.Utils import COMMASPACE, formatdate
from email import Encoders
import zipfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

class Processor(object):
    
    root_folder = os.path.dirname(os.path.realpath(__file__))
    email_from = "gtp@implicitdesign.co.za"
    email_to = ["gtp@implicitdesign.co.za", "laila@implicitdesign.co.za"]
    num_historical_months = 6
    num_working_hours = 8

    def __init__(self, user, user_email):
        self.user = user
        self.user_email = user_email
        self.test = (self.user=="test")
        self.input_path = os.path.join(self.root_folder, "input", self.user)

        if not os.path.exists(self.input_path):
            raise Exception("No user input file at %s " % self.input_path)

        self.output_path = os.path.join(self.root_folder, "output", self.user)
        self.temp_filename = os.path.join(self.output_path, "temp.org")
        self.load_rates()

        self.all_totals_graphs = []


    def load_rates(self):
        if self.test:
            rates_file_name = "rates_test.json"
        else:
            rates_file_name = "rates.json"
        rates = json.loads(open(os.path.join(self.root_folder, "rates.json")).read())
        if type(rates) != dict:
            raise Exception("Invalid rates file")
        self.user_rates = rates[self.user]

    def process(self):

        self.output_files = []
        self.summary_files = []
        self.historical_summary_files = []
        self.totals = {}
        self.historical_totals = []
        self.historical_dates = []
        self.crossfile_clocktables = {}

        self.update_input_folder()
        
        def callback(arg, dirname, fnames):
            for fname in fnames:
                
                only_include_rated_files = True
                
                is_valid_timesheet_file = fname[-4:] == ".org" and fname[0] != "." and fname[0] != "#" and \
                    ( not only_include_rated_files or fname in self.user_rates.keys())
                
                if is_valid_timesheet_file:
                    
                    #whole year
                    tstart = datetime.today() - timedelta(days=365)
                    tend = datetime.today()
                    output_file = os.path.join(self.output_path, fname) + "_365days_from_%s%d" % (calendar.month_abbr[tstart.month], tstart.year) + ".csv.txt"
                    graph_file = output_file + ".png"
                    if self.process_file(dirname, fname, output_file, graph_file, tstart, tend, {}):
                        self.output_files.append(output_file)
                        self.output_files.append(graph_file)

                    #current month
                    t = datetime.today()
                    tstart = datetime(t.year, t.month, 1)
                    output_file = os.path.join(self.output_path, fname) + "_%s%d" % (calendar.month_abbr[tstart.month], tstart.year) + ".csv.txt"
                    graph_file = output_file + ".png"
                    file_has_some_time_logged = self.process_file(dirname, fname, output_file, graph_file, tstart, tend, self.totals)
                    if True or file_has_some_time_logged: #tweak
                        self.output_files.append(output_file)
                        self.output_files.append(graph_file)
                        self.summary_files.append(output_file)
                        self.update_crossfile_clocktables()

                    #historical months
                    for i in range(self.num_historical_months):
                        t = datetime.today() - relativedelta(months=1)
                        tstart = tend = t - relativedelta(months=i)
                        tstart = datetime(tstart.year, tstart.month, 1)
                        tend = datetime(tend.year, tend.month, calendar.monthrange(tend.year, tend.month)[1])
                        output_file = os.path.join(self.output_path, fname) + "_%s%d" % (calendar.month_abbr[tstart.month], tstart.year) + ".csv.txt"
                        graph_file = output_file + ".png"
                        old_totals = {}
                        old_summary_files = []
                        if self.process_file(dirname, fname, output_file, graph_file, tstart, tend, old_totals):
                            self.output_files.append(output_file)
                            self.output_files.append(graph_file)
                            old_summary_files.append(output_file)
                            self.historical_totals.append(old_totals)
                            self.historical_summary_files.append(old_summary_files)
                            self.historical_dates.append((tstart, tend),)
                            self.update_crossfile_clocktables()

                    #file summary broken down by heading (not by date)
                    output_file = os.path.join(self.output_path, fname) + "_summary.csv.txt"
                    self.create_summary_clocktable_file(os.path.join(dirname, fname), self.temp_filename)
                    self.create_clocktable(self.temp_filename)
                    summary_clocktable = self.extract_summary_clocktable(self.temp_filename)
                    self.export_summary_clocktable(summary_clocktable, output_file)
                    self.output_files.append(output_file)

                else:
                    print("%s: Ignoring : %s" % (self.user,fname))

        print( "looking at %s" % self.input_path)
        os.path.walk(self.input_path, callback, None)
        self.write_crossfile_clocktables()

        totals_summary = self.create_totals_summary("Monthly total for " + datetime.today().strftime("%Y-%m-%d"), summary_date=datetime.today())

        open(os.path.join(self.output_path, "all_totals_summary.csv.txt"), "w").write(totals_summary)

        zip_file = os.path.join(self.output_path, "timesheets.zip")
        self.compress(zip_file)
        
        self.send_mail(attachments=[], text=totals_summary, email_to=self.email_to)
        self.send_mail(attachments=self.all_totals_graphs, text='monthly hours summary', email_to=[self.user_email] + self.email_to, content_type="image/png", title="Timesheet graphs for %s" % self.user)

    def process_file(self, dirname, fname, output_file, graph_file, tstart, tend, totals):
        filepath = os.path.join(dirname, fname)

        self.create_clocktable_file(filepath, self.temp_filename, tstart, tend)
        self.create_clocktable(self.temp_filename)
        total_minutes = self.extract_clocktables(self.temp_filename)

        totals[output_file] = total_minutes

        self.export_clocktables(output_file)
        self.plot_clocktable(graph_file)

        return total_minutes > 0
        
    def update_crossfile_clocktables(self):
        for clock_table in self.clock_tables:
            if clock_table['date'] in self.crossfile_clocktables.keys():
                self.crossfile_clocktables[clock_table['date']] += clock_table['minutes']
            else:
                self.crossfile_clocktables[clock_table['date']] = clock_table['minutes']

    def write_crossfile_clocktables(self):
        dates = self.crossfile_clocktables.keys()
        dates.sort()
        
        fs = {}
        cross_file_basename = "all_total_%s%d.csv.txt"
        date_format = "%Y-%m-%d"
        for d in dates:
            minutes = self.crossfile_clocktables[d]
            fname = d.strftime("%Y-%m")
            if fname not in fs.keys():
                output_file = os.path.join(self.output_path, cross_file_basename % (calendar.month_abbr[d.month], d.year))
                fs[fname] = f = csv.writer(open(output_file, "w"))
                f.writerow(["Date", "Day", "Minutes", "Hours decimal",])
                self.output_files.append(output_file)
            else:
                f = fs[fname]
            f.writerow([d.strftime(date_format), d.strftime("%a"), minutes, float(minutes)/60,])

        self.plot_crossfile_clocktables(dates)

    def plot_crossfile_clocktables(self, sorted_dates):
        plt.figure()
        last_d = None
        sorted_dates.append(datetime.today() + relativedelta(months=1)) #forces the loop to do one more time to get the last month
        for d in sorted_dates:
            if last_d is None or d.strftime("%Y-%m") != last_d.strftime("%Y-%m"):
                #month change, close file and reset variables

                if last_d is not None:
                    fname = "all_total_%s%d" % (calendar.month_abbr[last_d.month], last_d.year)
                    output_file = os.path.join(self.output_path, fname + ".csv.png")
                    self.plot_date(points_x, points_y, fname, output_file)
                    self.output_files.append(output_file)
                    self.all_totals_graphs.append(output_file)

                plt.figure()
                points_x = []
                points_y = []
                last_d = d

            else:
                points_x.append(d.toordinal())
                minutes = self.crossfile_clocktables[d]
                points_y.append( float(minutes)/60 )

    def plot_date(self, points_x, points_y, label, output_file):
        plt.plot_date(points_x, points_y, label=label, linewidth=1, linestyle='-', drawstyle='steps-mid', marker='None', fillstyle='full')

        if len(points_x) > 0:
            tstart = datetime.fromordinal(points_x[0])
            tend = datetime.fromordinal(points_x[-1])
            if tstart.month == tend.month and tstart.year == tend.year:
                plt.gca().xaxis.set_major_formatter(matplotlib.dates.DateFormatter('%a %d'))
                plt.gca().xaxis.set_major_locator(matplotlib.dates.DayLocator())

            for label in plt.gca().get_xticklabels():
                label.set_fontsize(6)
            for label in plt.gca().get_yticklabels():
                label.set_fontsize(6)

            plt.subplots_adjust(bottom=0.2)
            plt.xticks( rotation=45 )
            plt.title(os.path.basename(output_file))
            plt.xlabel('days')
            plt.ylabel('hours')

            plt.plot_date(points_x, list(8 for x in points_x))

        plt.savefig(output_file)

    def plot_clocktable(self, output_file):
        plt.figure()

        points_x = []
        points_y = []

        for clock_table in self.clock_tables:
            points_x.append(clock_table['date'].toordinal())
            points_y.append(float(clock_table['minutes'])/60)

        self.plot_date(points_x, points_y, os.path.basename(output_file), output_file)

    def create_summary_clocktable_file(self, input_file, output_file):
        clocktable_def = '#+BEGIN: clocktable :maxlevel 4 :scope file :link nil \n#+END:\n'
        f = open(output_file, "w")
        f.write(clocktable_def)
        f.write(open(input_file).read())

    def extract_summary_clocktable(self, input_file):
        clock_table = ""
        f = open(input_file)
        f.readline() 
        for line in f:
            if line[:5] == "#+END":
                return clock_table
            clock_table += line
        raise Exception("Shouldn't get here")

    def export_summary_clocktable(self, clocktable, output_file):
        open(output_file, "w").write(clocktable.replace(",", " ").replace("|", ","))

    def create_clocktable_file(self, input_file, output_file, tstart, tend):
        date_format = "%Y-%m-%d %a"
        clocktable_def = '#+BEGIN: clocktable :maxlevel 1 :scope file :link nil :tstart "<%s>" :tend "<%s>" :step day\n#+END:\n' % (tstart.strftime(date_format), tend.strftime(date_format))
        f = open(output_file, "w")
        f.write(clocktable_def)
        f.write(open(input_file).read())

    def create_clocktable(self, input_file):

        cmd = '''(list
                   (find-file "%s")
                   (org-clock-report)
                   (save-buffer)
                 )''' % input_file

        print("Running emacs on %s..." % input_file)
        process_args = ['emacs', '--batch', '--kill', '--eval', cmd]
        p = subprocess.Popen(process_args, stdout=open('/dev/null', 'w'), stderr=sys.stdout)
        p.wait()
        print("Emacs done")

    def get_latest_git_commit(self):
        return "(unknown)"

        #broken
        process_args = [os.path.join(self.root_folder, 'get_most_recent_git_commit_date.sh'), self.input_path]
        p = subprocess.Popen(process_args, stdout=subprocess.PIPE, stderr=sys.stdout)
        return p.communicate()[0]
        
    def update_input_folder(self):
        if self.user == "test":
            #'test' doesn't have a git repo, and we don't want to reset our code during development
            return

        process_args = [os.path.join(self.root_folder, 'reset_input_folder.sh'), self.input_path]
        p = subprocess.Popen(process_args, stdout=sys.stdout, stderr=sys.stdout)
        p.wait()

    def extract_clocktables(self, input_file):
        self.clock_tables = []
        total_minutes = 0
        f = open(input_file)
        f.readline() 
        for line in f:
            if line[:5] == "#+END":
                return total_minutes
            if line[:12] == "Daily report":
                clock_table = {}
                self.clock_tables.append(clock_table)
                clock_table['date'] = datetime.strptime(line[-16:-6], "%Y-%m-%d")
                
            if "Total time" in line:
                raw_time = line.split("|")[3].replace("*", "").strip()
                hours, minutes = raw_time.split(":")
                clock_table['minutes'] = 60*int(hours) + int(minutes)
                total_minutes += clock_table['minutes']
        raise Exception("Shouldn't get here")

    def export_clocktables(self, output_file):
        f = csv.writer(open(output_file, "w"))
        f.writerow(["Date", "Day", "Minutes", "Hours decimal",])
        date_format = "%Y-%m-%d"
        for clock_table in self.clock_tables:
            f.writerow([clock_table['date'].strftime(date_format), clock_table['date'].strftime("%a"), clock_table['minutes'], float(clock_table['minutes'])/60,])

    def compress(self, output_file):
        myzip = zipfile.ZipFile(output_file, 'w')
        for f in self.output_files:
            myzip.write(f, os.path.basename(f))
        myzip.close()

    def create_totals_summary(self, display_name, summary_date):

        def create_month_summary(summary_files, totals, display_name="", summary_date=None):
            total_cost = 0
            file_costs = []
            total_hours = 0
            c = ""
            if len(summary_files) == 0:
                return """%s\nNo summary_files""" % display_name
            else:
                for summary_file in summary_files:
                    name = os.path.basename(summary_file)
                    rate_name = name.split("_")[0]
                    hours_for_file = float(totals[summary_file])/60
                    total_hours += hours_for_file

                    if rate_name in self.user_rates.keys():
                        rate = self.user_rates[rate_name]
                        cost = rate * hours_for_file
                        total_cost += cost
                        cost_for_file = "R%.2f (%.2f hours @R%.2f)" % (cost, hours_for_file, self.user_rates[rate_name])
                        file_costs.append(name + " , " + cost_for_file)
                    else:
                        cost_for_file = "na"
                        file_costs.append(name + " : " + "(%.2f hours, no rate)" % hours_for_file)
                    c += "\n%s (%s for month so far)\n%s\n-------\n\n" % (name, cost_for_file, "".join(open(summary_file).readlines()))

                equivalent_to_days = float(total_hours)/self.num_working_hours
                rate_per_day = float(total_cost)/equivalent_to_days if equivalent_to_days>0 else 0
                rate_per_hour = float(total_cost)/total_hours if total_hours>0 else 0

                # if summary_date is None:
                #     date_display = name.split("_")[1].split(".")[0]
                #     summary_date = datetime.strptime(date_display, date_format)

                if summary_date is not None:
                    remaining_month_days = calendar.monthrange(summary_date.year, summary_date.month)[1]-summary_date.day
                    num_week_days = len(tuple((d for d in (summary_date + timedelta(n) for n in range(remaining_month_days)) if calendar.weekday(d.year, d.month, d.day)<5)))
                    estimated_total_cost_for_month = num_week_days*rate_per_day + total_cost
                else:
                    #this is a limitation of the code design, we should know the date, it's ridiculous
                    estimated_total_cost_for_month = 0
                    num_week_days = 0

                return """ 
                           Most recent commit date for %s : %s
                           For the month, %s: 
                           Total earned, R%.2f
                           Total hours, %.2f
                           Equivalent to days, %.2f
                           Equivalent to hourly rate, R%.2f
                           Projected for the month %.2f (assuming %d weekdays left)
                           ----\n""" % (self.user, self.get_latest_git_commit().strip(), name.split("_")[1].split(".")[0], 
                                        total_cost, total_hours, equivalent_to_days, rate_per_hour, 
                                        estimated_total_cost_for_month, num_week_days) + "\n".join(file_costs) + "\n---\n" + c

        c = create_month_summary(self.summary_files, self.totals, display_name=display_name, summary_date=summary_date) + "\n\n"

        c += "\n\n--------------HISTORICAL SUMMARY---------------\n"

        for i in range(len(self.historical_totals)):
            d = self.historical_dates[i][0]
            c += ("---  %s%d ---\n\n" % (calendar.month_abbr[d.month], d.year) + create_month_summary(self.historical_summary_files[i], self.historical_totals[i]))

        print c
        return c

    def send_mail(self, attachments, text, email_to, content_type="application/zip", title=None):

        if title is None:
            title = "Timesheets for %s" % self.user

        msg = MIMEMultipart()
        msg['From'] = self.email_from
        msg['Date'] = formatdate(localtime=True)
        msg['Subject'] = title

        msg.attach( MIMEText("Timesheets for %s\n\n%s" % (self.user, text)) )

        for f in attachments:
            part = MIMEBase(content_type.split("/")[0], content_type.split("/")[1])
            part.set_payload( open(f,"r").read() )
            Encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment', filename=os.path.basename(f))
            msg.attach(part)

        for email_tum in email_to:
            smtp = smtplib.SMTP("localhost")
            msg['To'] = email_tum
            smtp.sendmail(self.email_from, email_tum, msg.as_string())
            smtp.close()
            print("email sent to " + str(email_tum))
            

if __name__== "__main__":
    
    user=sys.argv[1]
    user_email=sys.argv[2]
    Processor(user, user_email).process()
