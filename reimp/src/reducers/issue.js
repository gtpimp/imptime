import assign from 'lodash/assign'
import difference from 'lodash/difference'
import union from 'lodash/union'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { stringifyIds } from '../actions/lib.js'

import {
    SET_ISSUE_STORE_VALUE,
    ANNOUNCE_BULK_CREATING_ISSUES,
    ANNOUNCE_BULK_CREATED_ISSUES,
} from '../actions/Issues.js'

const initialState = {
}

export default function issue(state = initialState, action) {

    let new_issue_props = null
    let issue_ids = null
    let state_clone = null

    switch (action.type) {
        case SET_ISSUE_STORE_VALUE:
            issue_ids = action.issue_ids
            state_clone = Object.assign({}, state)
            new_issue_props = {}
            new_issue_props[action.field_name] = action.new_value
            map(issue_ids, function(issue_id, index) {
                state_clone.items_by_id[issue_id] = Object.assign({}, state.items_by_id[issue_id],
                                                                  new_issue_props)
            })
            return state_clone

        case ANNOUNCE_BULK_CREATING_ISSUES:
            return Object.assign({}, state,
                                 {bulk_creating_issues: { sprint_id: action.sprint_id }})
            
        case ANNOUNCE_BULK_CREATED_ISSUES:
            return Object.assign({}, state,
                                 {bulk_creating_issues: null})
            
        default:
            return state
    }
}
