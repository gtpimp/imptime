import auth from './auth'
import billable_hours_statement from './billable_hours_statement'
import breadcrumbs from './breadcrumbs'
import estimate_summary from './estimate_summary'
import editable_property from './editable_property'
import filter from './filter'
import feature from './feature'
import global_comment_annotation from './global_comment_annotation'
import issue from './issue'
import issue_general_details from './issue_general_details'
import item from './item'
import item_list from './item_list'
import loading from './loading'
import maintenance from './maintenance'
import mien from './mien'
import notification_bar from './notification_bar.js'
import option_rememberer from './option_rememberer.js'
import page from './page'
import project from './project'
import project_dashboard from './project_dashboard'
import project_statement from './project_statement'
import work_summary from './work_summary'
import project_user_permission from './project_user_permission'
import company_user_permission from './company_user_permission'
import settings from './settings'
import sprint from './sprint'
import sprint_snapshot from './sprint_snapshot'
import sprint_user_rate from './sprint_user_rate'
import time_chart from './time_chart'
import time_summary from './time_summary'
import toolbar from './toolbar'
import user from './user'
import user_timesheet from './user_timesheet'
import websockets from './websockets'
import { combineReducers } from 'redux'
import { reducer as redux_form_reducer } from 'redux-form'

const rootReducer = combineReducers({
    auth,
    billable_hours_statement,
    breadcrumbs,
    company_user_permission,
    editable_property,
    estimate_summary,
    feature,
    filter,
    form: redux_form_reducer,
    global_comment_annotation,
    item,
    issue,
    issue_general_details,
    item_list,
    loading,
    maintenance,
    mien,
    notification_bar,
    option_rememberer,
    page,
    project,
    project_dashboard,
    project_statement,
    project_user_permission,
    work_summary,
    settings,
    sprint,
    sprint_snapshot,
    sprint_user_rate,    
    time_chart,
    time_summary,
    toolbar,
    user,
    user_timesheet,
    websockets,
})

export default rootReducer
