import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import auth from './auth'
import breadcrumbs from './breadcrumbs'
import filter from './filter'
import header from './header'
import item_list from './item_list'
import issue from './issue'
import issue_general_details from './issue_general_details'
import loading from './loading'
import notification_bar from './notification_bar.js'
import project from './project'
import rie from './rie'
import sprint from './sprint'
import user from './user'
import websockets from './websockets'
import settings from './settings'

const rootReducer = combineReducers({
    auth,
    breadcrumbs,
    filter,
    header,
    issue,
    issue_general_details,
    item_list,
    loading,
    notification_bar,
    project,
    rie,
    routing,
    sprint,
    user,
    websockets,
    settings
})

export default rootReducer
