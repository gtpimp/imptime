import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import auth from './auth'
import breadcrumbs from './breadcrumbs'
import filter from './filter'
import { reducer as redux_form_reducer } from 'redux-form'
import editable_property from './editable_property'
import header from './header'
import item_list from './item_list'
import issue from './issue'
import issue_general_details from './issue_general_details'
import loading from './loading'
import notification_bar from './notification_bar.js'
import page from './page'
import project from './project'
import project_user_permission from './project_user_permission'
import rie from './rie'
import sprint from './sprint'
import toolbar from './toolbar'
import user from './user'
import websockets from './websockets'
import settings from './settings'
import cost_summary from './cost_summary'
import time_summary from './time_summary'

const rootReducer = combineReducers({
    auth,
    breadcrumbs,
    cost_summary,
    editable_property,
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
