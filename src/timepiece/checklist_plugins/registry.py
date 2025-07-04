
from timepiece.checklist_plugins.rates_plugin import RatesPlugin
from timepiece.checklist_plugins.budget_present_plugin import BudgetPresetPlugin
from timepiece.checklist_plugins.over_budget_plugin import OverBudgetPlugin
from timepiece.checklist_plugins.missing_timesheet_entries_plugin import MissingTimesheetEntriesPlugin
from timepiece.checklist_plugins.issues_estimated_plugin import IssuesEstimatesPlugin
from timepiece.checklist_plugins.issues_assigned_plugin import IssuesAssignedPlugin
from timepiece.checklist_plugins.deadlines_plugin import DeadlinesPlugin
from timepiece.checklist_plugins.testable_plugin import TestablePlugin

finance_plugin_classes = [ RatesPlugin, BudgetPresetPlugin, OverBudgetPlugin ]
dev_plugin_classes = [ TestablePlugin, IssuesEstimatesPlugin, IssuesAssignedPlugin ]
traffic_plugin_classes = [ MissingTimesheetEntriesPlugin, DeadlinesPlugin ]

def get_finance_plugins(business):
    return [ x(business) for x in finance_plugin_classes ]

def get_dev_plugins(business):
    return [ x(business) for x in dev_plugin_classes ]

def get_traffic_plugins(business):
    return [ x(business) for x in traffic_plugin_classes ]
