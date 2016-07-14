import merge from 'lodash/merge'
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import map from 'lodash/map'
import filter from './filter'
import item_list from './item_list'
import issue from './issue'
import issue_general_details from './issue_general_details'
import notification_bar from './notification_bar.js'
import project from './project'
import rie from './rie'
import sprint from './sprint'
import user from './user'

const rootReducer = combineReducers({
    filter,
    issue,
    issue_general_details,
    item_list,
    notification_bar,
    project,
    rie,
    routing,
    sprint,
    user
})

export default rootReducer
