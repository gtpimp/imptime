import merge from 'lodash/merge'
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import map from 'lodash/map'
import sprint from './sprint'

const rootReducer = combineReducers({
    routing,
    sprint
})

export default rootReducer
