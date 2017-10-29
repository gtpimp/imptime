
export const LIST_KEY__PROJECT_LIST = 'projects'
export const LIST_KEY__SPRINT_LIST = 'sprints'
export const LIST_KEY__ISSUE_LIST = 'issues'
export const LIST_KEY__ISSUE_DEVELOPER_DETAILS = 'issue_developer_details'
export const LIST_KEY__USER_LIST = 'users'
export const LIST_KEY__PROJECT_USER_LIST = 'project_users'
export const LIST_KEY__PROJECT_DASHBOARD_LIST = 'project_dashboards'
export const LIST_KEY__USER_TIMESHEET_LIST = 'user_timesheets'
export const LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST = 'visual_spec_document_issue_list'

export const ENTITY_KEY__PROJECT = 'project'
export const ENTITY_KEY__SPRINT = 'sprint'
export const ENTITY_KEY__ISSUE = 'issue'
export const ENTITY_KEY__ISSUE_GENERAL_DETAILS = 'issue_general_details'
export const ENTITY_KEY__USER = 'user'
export const ENTITY_KEY__PROJECT_USER_PERMISSION = 'user'
export const ENTITY_KEY__PROJECT_DASHBOARD = 'project_dashboard'
export const ENTITY_KEY__USER_TIMESHEET = 'user_timesheet'
export const ENTITY_KEY__VISUAL_SPEC_DOCUMENT = 'visual_spec_document'
export const ENTITY_KEY__VISUAL_SPEC_ISSUE = 'visual_spec_issue'

export const PAGE_KEY__DASHBOARD_PATH = 'dashboard_page'
export const PAGE_KEY__PROJECTS_PAGE = 'projects_page'
export const PAGE_KEY__PROJECT_DASHBOARD_PAGE = 'project_dashboard_page'
export const PAGE_KEY__PROJECT_USER_PAGE = 'project_user_page'
export const PAGE_KEY__SPRINTS_PAGE = 'sprints_page'
export const PAGE_KEY__SPRINTS_TOOLBAR = 'sprints_toolbar'
export const PAGE_KEY__SPRINT_DASHBOARD_PAGE = 'sprint_dashboard_page'
export const PAGE_KEY__ISSUES_PAGE = 'issues_page'
export const PAGE_KEY__ISSUE_DASHBOARD_PAGE = 'issue_dashboard_page'
export const PAGE_KEY__USER_TIMESHEET_PAGE = 'user_timesheet_page'
export const PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE = 'visual_spec_document_page'

export const SELECTOR__SPRINTS = 'selector_sprints'
export const FILTER_KEY__GLOBAL = 'global_filter'

export var ISSUE_HEADER_LIST_WIDE = {'number':"#",
                                     'expand_feature': '',
                                     'name': "Name",
                                     'assignee': "Assignee",
                                     'created_at': "Created at", 
                                     'status': "Status",
                                     'estimated': "Estimates",
                                     'tags': "Tags",
                                     'progress': "Progress",
                                     'my_time': "My Time",
                                     'clock_in': "Clock in",
                                     'delete': "Delete"}

export var ISSUE_HEADER_LIST_NARROW = {'number':"#",
                                       'expand_feature': '',
                                       'name': "Name",
                                       'assignee': "Assignee",
                                       'status': "Status"}

export var ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE = {
    'number':'#',
    'name': 'Name',
    'status': 'Status',
    'estimates': "Estimates",
}
