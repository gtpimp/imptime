
from rates_plugin import RatesPlugin
from budget_present_plugin import BudgetPresetPlugin
from over_budget_plugin import OverBudgetPlugin
from missing_timesheet_entries_plugin import MissingTimesheetEntriesPlugin
from issues_estimated_plugin import IssuesEstimatesPlugin
from issues_assigned_plugin import IssuesAssignedPlugin

finance_plugin_classes = [ RatesPlugin, BudgetPresetPlugin, OverBudgetPlugin ]
def get_finance_plugins(business):
    return [ x(business) for x in finance_plugin_classes ]

dev_plugin_classes = [  ]
def get_dev_plugins(business):
    return [ x(business) for x in dev_plugin_classes ]

traffic_plugin_classes = [ MissingTimesheetEntriesPlugin, IssuesEstimatesPlugin, IssuesAssignedPlugin ]
def get_traffic_plugins(business):
    return [ x(business) for x in traffic_plugin_classes ]
