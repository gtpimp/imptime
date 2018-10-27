export const LIST_KEY__PROJECT_LIST = 'projects'
export const LIST_KEY__SPRINT_LIST = 'sprints'
export const LIST_KEY__FEATURE_LIST = 'features'
export const LIST_KEY__COMPANY_LIST = 'companies'
export const LIST_KEY__COMPANY_USER_LIST = 'company_users'
export const LIST_KEY__DECISION_JOURNAL_LIST = 'decision_journals'
export const LIST_KEY__ISSUE_LIST = 'issues'
export const LIST_KEY__MY_ISSUE_LIST_DUE_NOW = 'my_issues_due_now'
export const LIST_KEY__INVOICE_LIST = 'invoices'
export const LIST_KEY__ISSUE_HISTORY_LIST = 'issue_history'
export const LIST_KEY__CLOCK_HISTORY_LIST = 'clock_history'
export const LIST_KEY__ISSUE_DEVELOPER_DETAILS = 'issue_developer_details'
export const LIST_KEY__ISSUES_FOR_PROPOSAL = 'issues_for_proposal'
export const LIST_KEY__USER_LIST = 'users'
export const LIST_KEY__PROJECT_USER_LIST = 'project_users'
export const LIST_KEY__PROJECT_DASHBOARD_LIST = 'project_dashboards'
export const LIST_KEY__SPRINT_ROADMAP = 'sprint_roadmaps'
export const LIST_KEY__SPRINT_COST_SUMMARY = 'sprint_cost_summaries'
export const LIST_KEY__SPRINT_DEADLINE = 'sprint_deadlines'
export const LIST_KEY__USER_TIMESHEET_LIST = 'user_timesheets'
export const LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST = 'visual_spec_document_issue_list'
export const LIST_KEY__RELEASE_NOTES_LIST = 'release_notes_list'
export const LIST_KEY__RELEASE_NOTES_EDITOR_LIST = 'release_notes_editor_list'
export const LIST_KEY__NUDGE_LIST = 'nudge_list'
export const LIST_KEY__COMPANY_PROBLEM_LIST = 'company_problem_list'
export const LIST_KEY__SCHEDULE_LIST = 'schedule_list'
export const LIST_KEY__CALENDAR_EVENT_LIST = 'calendar_item_list'
export const LIST_KEY__FORM_TAG_LIST = 'form_tag_list'
export const LIST_KEY__MIEN_LIST = 'mien_list'
export const LIST_KEY__WIKI_LIST = 'wiki_list'
export const LIST_KEY__AUTO_CLOCK = 'auto_clock'
export const LIST_KEY__RECENT_AUTO_CLOCK_BY_ISSUE = 'recent_auto_clock_by_issue'
export const LIST_KEY__RECENT_AUTO_CLOCK = 'recent_auto_clock'
export const LIST_KEY__RECENT_AUTO_CLOCK_UNALLOCATED = 'recent_auto_clock_unallocated'
export const LIST_KEY__SPRINT_RATES = 'sprint_rates'
export const LIST_KEY__WORK_SUMMARY_LIST = 'work_summaries'
export const LIST_KEY__SPRINT_SNAPSHOT_LIST = 'sprint_snapshots'

export const ENTITY_KEY__CALENDAR_EVENT = 'calendar_event'
export const ENTITY_KEY__INVOICE = 'invoice'
export const ENTITY_KEY__ISSUE_HISTORY = 'issue_history'
export const ENTITY_KEY__PROJECT = 'project'
export const ENTITY_KEY__SPRINT = 'sprint'
export const ENTITY_KEY__FEATURE = 'feature'
export const ENTITY_KEY__COMPANY = 'company'
export const ENTITY_KEY__DECISION_JOURNAL = 'decision_journal'
export const ENTITY_KEY__ISSUE = 'issue'
export const ENTITY_KEY__ISSUE_GENERAL_DETAILS = 'issue_general_details'
export const ENTITY_KEY__ISSUE_REVIEW = 'issue_review'
export const ENTITY_KEY__USER = 'user'
export const ENTITY_KEY__PROJECT_USER_PERMISSION = 'user'
export const ENTITY_KEY__PROJECT_DASHBOARD = 'project_dashboard'
export const ENTITY_KEY__USER_TIMESHEET = 'user_timesheet'
export const ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT = 'annotated_visual_spec_document'
export const ENTITY_KEY__VISUAL_SPEC_DOCUMENT = 'visual_spec_document'
export const ENTITY_KEY__VISUAL_SPEC_ANNOTATION = 'visual_spec_annotation'
export const ENTITY_KEY__RELEASE_NOTE = 'release_note'
export const ENTITY_KEY__SPRINT_DEADLINE = 'sprint_deadline'
export const ENTITY_KEY__SPRINT_REVIEW = 'sprint_review'
export const ENTITY_KEY__SPRINT_ROADMAP = 'sprint_roadmap'
export const ENTITY_KEY__TAG = 'tag'
export const ENTITY_KEY__NUDGE = 'nudge'
export const ENTITY_KEY__COMPANY_PROBLEM = 'company_problem'
export const ENTITY_KEY__SCHEDULE = 'schedule'
export const ENTITY_KEY__MIEN = 'mien'
export const ENTITY_KEY__WIKI = 'wiki'
export const ENTITY_KEY__AUTO_CLOCK = 'auto_clock'
export const ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY = 'multiple_issue_summary'
export const ENTITY_KEY__SPRINT_USER_RATE = 'sprint_user_rate'
export const ENTITY_KEY__WORK_SUMMARY = 'work_summary'
export const ENTITY_KEY__SPRINT_COST_SUMMARY = 'sprint_cost_summary'
export const ENTITY_KEY__SPRINT_SNAPSHOT = 'sprint_snapshot'

// Temporary list to keep track of which entities are using the new actions/Item.js
// mechanism and therefore are in a different place in the state.
export const GENERIC_ENTITIES = [ ENTITY_KEY__RELEASE_NOTE,
                                  ENTITY_KEY__ISSUE,
                                  ENTITY_KEY__INVOICE,
                                  ENTITY_KEY__ISSUE_HISTORY,
                                  ENTITY_KEY__DECISION_JOURNAL,
                                  ENTITY_KEY__MIEN,
                                  ENTITY_KEY__WIKI,
                                  ENTITY_KEY__SPRINT_USER_RATE,
                                  ENTITY_KEY__FEATURE,
                                  ENTITY_KEY__COMPANY,
                                  ENTITY_KEY__DECISION_JOURNAL,
                                  ENTITY_KEY__CALENDAR_EVENT,
                                  ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT,
                                  ENTITY_KEY__SPRINT_COST_SUMMARY,
                                  ENTITY_KEY__SPRINT_SNAPSHOT ]

export const PAGE_KEY__CALENDAR_PAGE = 'calendar_page'
export const PAGE_KEY__DASHBOARD_PAGE = 'dashboard_page'
export const PAGE_KEY__INVOICES_PAGE = 'issue_history_page'
export const PAGE_KEY__ISSUE_HISTORY_PAGE = 'issue_history_page'
export const PAGE_KEY__PROJECTS_PAGE = 'projects_page'
export const PAGE_KEY__PROJECT_DASHBOARD_PAGE = 'project_dashboard_page'
export const PAGE_KEY__PROJECT_ROADMAP_PAGE = 'project_roadmap_page'
export const PAGE_KEY__PROJECT_USER_PAGE = 'project_user_page'
export const PAGE_KEY__SPRINTS_PAGE = 'sprints_page'
export const PAGE_KEY__FEATURES_PAGE = 'features_page'
export const PAGE_KEY__COMPANIES_PAGE = 'companies_page'
export const PAGE_KEY__COMPANY_USER_PAGE = 'company_user_page'
export const PAGE_KEY__DECISION_JOURNALS_PAGE = 'decision_journal_page'
export const PAGE_KEY__FLAT_FEATURES_PAGE = 'flat_features_page'
export const PAGE_KEY__SPRINT_TEMPLATES_PAGE = 'sprint_templates_page'
export const PAGE_KEY__SPRINTS_TOOLBAR = 'sprints_toolbar'
export const PAGE_KEY__SPRINT_TEMPLATES_TOOLBAR = 'sprint_templates_toolbar'
export const PAGE_KEY__SPRINT_DASHBOARD_PAGE = 'sprint_dashboard_page'
export const PAGE_KEY__SPRINT_PROPOSAL_PAGE = 'sprint_proposal_page'
export const PAGE_KEY__SPRINT_RATE_PAGE = 'sprint_rate_page'
export const PAGE_KEY__ISSUES_PAGE = 'issues_page'
export const PAGE_KEY__ISSUE_DASHBOARD_PAGE = 'issue_dashboard_page'
export const PAGE_KEY__USER_TIMESHEET_PAGE = 'user_timesheet_page'
export const PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE = 'visual_spec_document_page'
export const PAGE_KEY__BULK_CREATE_ISSUES_PAGE = 'bulk_create_issues_page'
export const PAGE_KEY__BULK_CREATE_FEATURES_PAGE = 'bulk_create_features_page'
export const PAGE_KEY__RELEASE_NOTES_PAGE = 'release_notes_page'
export const PAGE_KEY__NUDGE_PAGE = 'nudge_page'
export const PAGE_KEY__COMPANY_PROBLEM_PAGE = 'company_problem_page'
export const PAGE_KEY__SCHEDULE_PAGE = 'schedules_page'
export const PAGE_KEY__SCHEDULE_ITEM_PAGE = 'schedule_item_page'
export const PAGE_KEY__PROJECT_WIKI_PAGE = 'project_wiki_page'
export const PAGE_KEY__AUTH_PAGE = 'auth_page'
export const PAGE_KEY__BILLABLE_HOURS_STATEMENT_PAGE = 'billable_hours_statement_page'
export const PAGE_KEY__SPRINT_SNAPSHOT_PAGE = 'sprint_snapshot_page'
export const PAGE_KEY__CLOCK_HISTORY_PAGE = 'clock_history_page'

export const HEADER_LIST_NAME__ISSUE = "issue"
export const HEADER_LIST_NAME__DUE_ISSUE = "due_issue"
export const HEADER_LIST_NAME__SPRINT = "sprint"
export const HEADER_LIST_NAME__FEATURE = "feature"
export const HEADER_LIST_NAME__COMPANY = "company"
export const HEADER_LIST_NAME__DECISION_JOURNAL = "decision_journal"
export const HEADER_LIST_NAME__NUDGE = "nudge"
export const HEADER_LIST_NAME__SPRINT_PROPOSAL = "sprint_proposal"

export const CONTEXT_KEY__AUTO_CLOCK = 'auto_clock_context'
export const PAGE_KEY__WORK_SUMMARY_PAGE = 'work_summary_page'

export const SELECTOR__PROJECTS = 'selector_projects'
export const SELECTOR__SPRINTS = 'selector_sprints'
export const SELECTOR__FEATURES = 'selector_features'
export const SELECTOR__ISSUES = 'selector_issues'
export const SELECTOR__ISSUE_GROUPS = 'selector_issue_groups'
export const FILTER_KEY__GLOBAL = 'global_filter'

export const large_col_width = "300px"
export const medium_col_width = "150px"
export const small_col_width = "90px"
export const tiny_col_width = "20px"

export function getCellStyle(s) { 
    // For use with the header lists below

    const flex_grow = s.flex || 0
    const flex_shrink = s.flex || 0
    const flex_basis = s.width
    
    return {
        "maxWidth":s.width,
        "flex": ""+flex_grow+" "+flex_shrink+" "+flex_basis
    }
}

export var INVOICE_HEADER_LIST = {'invoice_number': {label:"Number", width:"auto", flex:1},
                                  'client_name': {label:'Client', width:'auto', flex:1},
                                  //'internal_comment': {label:'Comment', width:'auto', flex:1},
                                  'project_id': {label:'Project', width:'auto', flex:1},
                                  'sprint_id': {label:'Sprint', width:'auto', flex:1},
                                  'created': {label:'Created at', width:'auto', flex:1},
                                  'issued_at': {label:'Issued at', width:'auto', flex:1},
                                  'payment_due': {label:'Due at', width:'auto', flex:1},
                                  'paid_at': {label:'Paid at', width:'auto', flex:1},
                                  'status': {label:'status', width:'auto', flex:1},
                                  'is_overdue': {label:'Overdue', width:'auto', flex:1},
                                  'cost_ex_vat': {label:'cost_ex_vat', width:'auto', flex:1},
                                  'vat': {label:'Vat', width:'auto', flex:1},
                                  'cost_with_vat': {label:'cost_with_vat', width:'auto', flex:1},
                                  'amount_paid': {label:'amount_paid', width:'auto', flex:1},
                                  'amount_written_off': {label:'amount_written_off', width:'auto', flex:1},
                                  'amount_owed': {label:'amount_owed', width:'auto', flex:1},
                                  'invoice_note': {label:'Note', width:'auto', flex:1},
                                  //'footer_terms': {label:'footer_terms', width:'auto', flex:1},
                                  //'client_order_name': {label:'Order name', width:'auto', flex:1},
                                  //'client_order_number': {label:'Order number', width:'auto', flex:1}
}

export var ISSUE_HISTORY_HEADER_LIST = [ {key:'created_by', label:"User", description:"The user who made the change", width:medium_col_width},
                                         {key:'created_at', label:"Date", description:"When the change was made", width:medium_col_width},
                                         {key:'description', label:"Description", description:"What type of change was made", width:medium_col_width},
                                         {key:'before', label:"Before", description:"The value before the change", width:medium_col_width},
                                         {key:'after', label:"After", description:"The value after the change", width:medium_col_width} ]

export var PROJECT_HEADER_LIST = {'name': {label:"Name", width:"auto", flex:1},
                                  'active': {label:"Active", width: small_col_width},
                                  'num_sprints': {label:"Sprints", width: medium_col_width},
                                  'created_at': {label:"Created", width: medium_col_width},
                                  'sort_reason': {label:"Recent activity type", width: medium_col_width},
                                  'sort_date': {label:"Recent activity on", width: medium_col_width},
                                  'small_delete': {label:"", width:tiny_col_width}
}

export var SCHEDULE_HEADER_LIST =
    [ {key:'name', label:'Name', description:'Schedule Name', width:large_col_width},
      {key:'owner', label:'Owner', description:'Owner of the schedule', width:medium_col_width},
      {key:'created_at', label:'Created', description:'Created at', width:medium_col_width},
      {key:'viewable_users', label:'Viewable users', description:'Users who can view this schedule', width:medium_col_width},
      {key:'editable_users', label:'Editable users', description:'Users who can edit this schedule', width:medium_col_width}
    ]

export var BRIEF_SCHEDULE_HEADER_LIST = [{key:'owner', label:'Owner', description:'Owner of the schedule', width:small_col_width},
                                         {key:'name', label:'Name', description:'Schedule Name', width:large_col_width}]

export var COMPANY_PROBLEM_HEADER_LIST = [ {key:'status', label:'Status', description:'Status', width:medium_col_width},
                                           {key:'project', label:'Project', description:'Project', width:medium_col_width},
                                           {key:'sprint', label:'Sprint', description:'Sprint', width:medium_col_width},
                                           {key:'user', label:'User', description:'Affected user', width:large_col_width},
                                           {key:'created_at', label:'Created at', description:'Was a problem at', width:medium_col_width},
                                           {key:'modified_at', label:'Modified at', description:'Last modified at', width:medium_col_width},
                                           {key:'problem_type', label:'Type', description:'Type', width:medium_col_width},
                                           {key:'description', label:'Description', description:'Description', width:medium_col_width},
                                           {key:'action_buttons', label:'', description:'Action buttons', width:large_col_width}
]


export var BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_USER =
    [ {key:'user', label:'User', description:'User', width:medium_col_width},
      {key:'hours', label:'Actual hours', description:'Hours', width:medium_col_width},
      {key:'cost', label:'Cost', description:'Cost', width:medium_col_width},
      {key:'business_days', label:'Available business days', description:'Total business days excluding public holidays', width:medium_col_width},
      {key:'num_off_days', label:'Off days', description:'Number of sick and leave days', width:medium_col_width},
      {key:'adjusted_days', label:'Adjusted working days', description:'Working days excluding public holidays and leave/sick days', width:medium_col_width},
      {key:'adjusted_hours', label:'Adjusted working hours', description:'Working hours excluding public holidays and leave/sick days', width:medium_col_width},
      {key:'missing_hours', label:'Missing hours', description:'Unlogged hours that should have been worked', width:medium_col_width},
    ]
    

export var BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_PROJECT =
    [ {key:'project', label:'Project', description:'Project', width:medium_col_width},
      {key:'hours', label:'Hours', description:'Hours', width:medium_col_width},
      {key:'cost', label:'Cost', description:'Cost', width:medium_col_width}
    ]

export var BILLABLE_HOURS_STATEMENT_HEADER_LIST__BY_PROJECT_AND_USER =
    [ {key:'project', label:'Project', description:'Project', width:medium_col_width},
      {key:'sprint', label:'Sprint', description:'Sprint', width:medium_col_width},
      {key:'user', label:'User', description:'User', width:medium_col_width},
      {key:'hours', label:'Hours', description:'Hours', width:medium_col_width},
      {key:'cost', label:'Cost', description:'Cost', width:medium_col_width}
    ]

export var BILLABLE_HOURS_STATEMENT_HEADER_LIST__TOTALS =
    [ {key:'hours', label:'Hours', description:'Hours', width:medium_col_width},
      {key:'cost', label:'Cost', description:'Cost', width:medium_col_width}
    ]

export var ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE = {
    'number':{label:'#', width:tiny_col_width},
    'name': {label:'Name', width:"auto", flex:1},
    'status': {label:'Status', width:medium_col_width},
    'estimated': {label:"Estimates", width:medium_col_width},
    'small_delete': {label:"", width:tiny_col_width}
}

export var SPRINT_TYPE_ORDER = [ 'inbox',
                                 'sprint',
                                 'minutes',
                                 'sprinkle',
                                 'spec',
                                 'checklist',
                                 'template',
                                 'regression',
                                 'audit',
                                 'backlog' ]
