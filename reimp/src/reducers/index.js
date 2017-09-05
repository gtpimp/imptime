import auth from './auth'
import breadcrumbs from './breadcrumbs'
import cost_summary from './cost_summary'
import estimate_summary from './estimate_summary'
import editable_property from './editable_property'
import filter from './filter'
import header from './header'
import issue from './issue'
import issue_general_details from './issue_general_details'
import item_list from './item_list'
import loading from './loading'
import notification_bar from './notification_bar.js'
import page from './page'
import project from './project'
import project_statement from './project_statement'
import project_user_permission from './project_user_permission'
import rie from './rie'
import settings from './settings'
import sprint from './sprint'
import time_summary from './time_summary'
import toolbar from './toolbar'
import user from './user'
import websockets from './websockets'
import { combineReducers } from 'redux'
import { reducer as redux_form_reducer } from 'redux-form'
import { routerReducer as routing } from 'react-router-redux'

const rootReducer = combineReducers({
    auth,
    breadcrumbs,
    cost_summary,
    editable_property,
    estimate_summary,
    filter,
    form: redux_form_reducer,
    header,
    issue,
    issue_general_details,
    item_list,
    loading,
    notification_bar,
    page,
    project,
    project_statement,
    project_user_permission,
    rie,
    routing,
    settings,
    sprint,
    time_summary,
    toolbar,
    user,
    websockets,
})

export default rootReducer
