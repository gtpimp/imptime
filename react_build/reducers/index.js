import merge from 'lodash/merge'
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import map from 'lodash/map'
import item_list from './item_list'
import project from './project'
import notification_bar from './notification_bar.js'

const rootReducer = combineReducers({
    routing,
    project,
    item_list,
    notification_bar
})

export default rootReducer
