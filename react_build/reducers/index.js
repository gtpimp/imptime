import merge from 'lodash/merge'
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import map from 'lodash/map'
import item_list from './item_list'
import projects from './projects'

const rootReducer = combineReducers({
    routing,
    projects,
    item_list
})

export default rootReducer
