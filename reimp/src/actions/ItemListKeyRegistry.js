
export const LIST_KEY__PROJECT_LIST = 'projects'
export const LIST_KEY__SPRINT_LIST = 'sprints'
export const LIST_KEY__ISSUE_LIST = 'issues'
export const LIST_KEY__ISSUE_DEVELOPER_DETAILS = 'issue_developer_details'
export const LIST_KEY__USER_LIST = 'users'
export const LIST_KEY__PROJECT_USER_LIST = 'project_users'
export const LIST_KEY__PROJECT_DASHBOARD_LIST = 'project_dashboards'
export const LIST_KEY__PROJECT_ROADMAP = 'project_roadmap'
export const LIST_KEY__USER_TIMESHEET_LIST = 'user_timesheets'
export const LIST_KEY__VISUAL_SPEC_DOCUMENT_ISSUE_LIST = 'visual_spec_document_issue_list'
export const LIST_KEY__RELEASE_NOTES_LIST = 'release_notes_list'
export const LIST_KEY__RELEASE_NOTES_EDITOR_LIST = 'release_notes_editor_list'
export const LIST_KEY__NUDGE_LIST = 'nudge_list'

export const ENTITY_KEY__PROJECT = 'project'
export const ENTITY_KEY__SPRINT = 'sprint'
export const ENTITY_KEY__ISSUE = 'issue'
export const ENTITY_KEY__ISSUE_GENERAL_DETAILS = 'issue_general_details'
export const ENTITY_KEY__ISSUE_REVIEW = 'issue_review'
export const ENTITY_KEY__USER = 'user'
export const ENTITY_KEY__PROJECT_USER_PERMISSION = 'user'
export const ENTITY_KEY__PROJECT_DASHBOARD = 'project_dashboard'
export const ENTITY_KEY__USER_TIMESHEET = 'user_timesheet'
export const ENTITY_KEY__VISUAL_SPEC_DOCUMENT = 'visual_spec_document'
export const ENTITY_KEY__VISUAL_SPEC_ISSUE = 'visual_spec_issue'
export const ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION = 'visual_spec_issue_annotation'
export const ENTITY_KEY__RELEASE_NOTE = 'release_note'
export const ENTITY_KEY__SPRINT_DEADLINE = 'sprint_deadline'
export const ENTITY_KEY__SPRINT_REVIEW = 'sprint_review'
export const ENTITY_KEY__SPRINT_ROADMAP = 'sprint_roadmap'
export const ENTITY_KEY__TAG = 'tag'
export const ENTITY_KEY__NUDGE = 'nudge'

// Temporary list to keep track of which entities are using the new actions/Item.js
// mechanism and therefore are in a different place in the state.
export const GENERIC_ENTITIES = [ ENTITY_KEY__RELEASE_NOTE, ENTITY_KEY__VISUAL_SPEC_ISSUE ]

export const PAGE_KEY__DASHBOARD_PATH = 'dashboard_page'
export const PAGE_KEY__PROJECTS_PAGE = 'projects_page'
export const PAGE_KEY__PROJECT_DASHBOARD_PAGE = 'project_dashboard_page'
export const PAGE_KEY__PROJECT_ROADMAP_PAGE = 'project_roadmap_page'
export const PAGE_KEY__PROJECT_USER_PAGE = 'project_user_page'
export const PAGE_KEY__SPRINTS_PAGE = 'sprints_page'
export const PAGE_KEY__SPRINT_TEMPLATES_PAGE = 'sprint_templates_page'
export const PAGE_KEY__SPRINTS_TOOLBAR = 'sprints_toolbar'
export const PAGE_KEY__SPRINT_TEMPLATES_TOOLBAR = 'sprint_templates_toolbar'
export const PAGE_KEY__SPRINT_DASHBOARD_PAGE = 'sprint_dashboard_page'
export const PAGE_KEY__ISSUES_PAGE = 'issues_page'
export const PAGE_KEY__ISSUE_DASHBOARD_PAGE = 'issue_dashboard_page'
export const PAGE_KEY__USER_TIMESHEET_PAGE = 'user_timesheet_page'
export const PAGE_KEY__VISUAL_SPEC_DOCUMENT_PAGE = 'visual_spec_document_page'
export const PAGE_KEY__BULK_CREATE_ISSUES_PAGE = 'bulk_create_issues_page'
export const PAGE_KEY__RELEASE_NOTES_PAGE = 'release_notes_page'
export const PAGE_KEY__NUDGE_PAGE = 'nudge_page'

export const SELECTOR__SPRINTS = 'selector_sprints'
export const FILTER_KEY__GLOBAL = 'global_filter'

const medium_col_width = "150px"
const small_col_width = "90px"
const tiny_col_width = "20px"

export function getCellStyle(s) {
    // For use with the header lists below
    return {
        "minWidth":s.width,
        "maxWidth":s.width,
        "flex":s.flex || 0
    }
}

export var PROJECT_HEADER_LIST = {'name': {label:"Name", width:"auto", flex:1},
                                  'num_sprints': {label:"Sprints", width: medium_col_width},
}

export var SPRINT_HEADER_LIST = {'name': {label:"Name", width:"auto", flex:1},
                                 'start_time': {label:"Start time", width:small_col_width},
                                 'end_time': {label:"End time", width:small_col_width},
                                 'num_issues': {label:"Issues", width: small_col_width},
                                 //'progress': {label:"Progress", width: small_col_width},
                                 'status': {label:"Status", width:small_col_width},
                                 'type': {label:"Type", width:small_col_width}
}

export var ISSUE_HEADER_LIST_WIDE = {'number': {label:"#", width:tiny_col_width},
                                     'adhoc': {label:'', width:tiny_col_width},
                                     'expand_feature': {label:'', width:tiny_col_width},
                                     'name': {label:"Name", width:"auto", flex:1},
                                     'assignee': {label:"Assignee", width:medium_col_width},
                                     'created_at': {label:"Created at", width:medium_col_width},
                                     'status': {label:"Status", width:medium_col_width},
                                     'tags': {label:"Tags", width:medium_col_width},
                                     'estimated': {label:"Estimates", width:medium_col_width},
                                     'clock_in': {label:"Clock in", width:small_col_width},
                                     'small_delete': {label:"", width:tiny_col_width}
}

export var ISSUE_HEADER_LIST_NARROW = {'number':{label:"#", width:tiny_col_width},
                                       'type': {label:'', width:tiny_col_width},
                                       'expand_feature': {label:'', width:tiny_col_width},
                                       'name': {label:"Name", width:"auto", flex:1},
                                       'assignee': {label:"Assignee", width:medium_col_width},
                                       'status': {label:"Status", width:medium_col_width},
                                       'estimated': {label:"Estimates", width:medium_col_width},
                                       'small_delete': {label:"", width:tiny_col_width}
}

/* export var ISSUE_HEADER_LIST_FEATURE = {'number': {label:"#", width:tiny_col_width},
 *                                         'expand_feature': {label:'', width:tiny_col_width},
 *                                         'name': {label:"Name", width:"50%"}
 * }*/

export var ISSUE_HEADER_LIST_VISUAL_SPEC_DOCUMENT_PAGE = {
    'number':{label:'#', width:tiny_col_width},
    'name': {label:'Name', width:"auto", flex:1},
    'status': {label:'Status', width:medium_col_width},
    'estimated': {label:"Estimates", width:medium_col_width},
    'small_delete': {label:"", width:tiny_col_width}
}

export var SPRINT_TYPE_ORDER = [ 'inbox', 'sprint', 'sprinkle', 'spec', 'checklist', 'backlog', 'template' ]
