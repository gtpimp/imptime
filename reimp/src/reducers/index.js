import auth from './auth'
import breadcrumbs from './breadcrumbs'
import cost_summary from './cost_summary'
import estimate_summary from './estimate_summary'
import editable_property from './editable_property'
import filter from './filter'
import global_comment_annotation from './global_comment_annotation'
import issue from './issue'
import issue_general_details from './issue_general_details'
import item from './item'
import item_list from './item_list'
import loading from './loading'
import maintenance from './maintenance'
import notification_bar from './notification_bar.js'
import option_rememberer from './option_rememberer.js'
import page from './page'
import project from './project'
import project_dashboard from './project_dashboard'
import project_statement from './project_statement'
import work_summary from './work_summary'
import project_user_permission from './project_user_permission'
import rie from './rie'
import settings from './settings'
import sprint from './sprint'
import sprint_user_rate from './sprint_user_rate'
import time_chart from './time_chart'
import time_summary from './time_summary'
import toolbar from './toolbar'
import user from './user'
import user_timesheet from './user_timesheet'
import websockets from './websockets'
import { combineReducers } from 'redux'
import { reducer as redux_form_reducer } from 'redux-form'
import primary_header from './header'

const rootReducer = combineReducers({
    auth,
    breadcrumbs,
    cost_summary,
    editable_property,
    estimate_summary,
    filter,
    form: redux_form_reducer,
    global_comment_annotation,
    item,
    issue,
    issue_general_details,
    item_list,
    loading,
    maintenance,
    notification_bar,
    option_rememberer,
    page,
    primary_header,
    project,
    project_dashboard,
    project_statement,
    project_user_permission,
    work_summary,
    rie,
    settings,
    sprint,
    sprint_user_rate,    
    time_chart,
    time_summary,
    toolbar,
    user,
    user_timesheet,
    websockets,
})

export default rootReducer
