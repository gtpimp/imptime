import {
    ASYNC_REFRESH_NOTIFICATION
} from '../actions/Async'

import { invalidateProjects } from '../actions/Projects'
import { invalidateSprints } from '../actions/Sprints'
import { invalidateIssues } from '../actions/Issues'
import { invalidateIssueGeneralDetails } from '../actions/IssueGeneralDetails'

import {
    invalidateList
} from '../actions/ItemList'

import {
    LIST_KEY__PROJECT_LIST,
    LIST_KEY__SPRINT_LIST,
    LIST_KEY__ISSUE_LIST    
} from '../actions/ItemListKeyRegistry'

function triggerInvalidateEntity(d, dispatch) {
    // used for updates of existing objects, invalidates or
    // removes the object from the primary entitylists.
    //
    // Components which refer to these objects should automatically refresh
    // these object on demand using componentWillReceiveProps
    if ( d.entity_name == 'project' ) {
        dispatch(invalidateProjects([d.entity_ref]))
	
    } else if ( d.entity_name == 'sprint' ) {
        dispatch(invalidateSprints([d.entity_ref]))
	
    } else if ( d.entity_name == 'issue' ) {
        dispatch(invalidateIssues([d.entity_ref]))
        dispatch(invalidateIssueGeneralDetails([d.entity_ref]))
	
    } else {
        console.log("Unknown entity to refresh: " + d.entity_name)
    }
}

function triggerInvalidateItemLists(d, dispatch) {
    // used for creation of new objects. invalidates the lists that point to
    // these objects.
    //
    // Components which show lists of objects should automatically
    // refresh their lists on demand using componentWillReceiveProps
    if ( d.entity_name == 'project' ) {
        dispatch(invalidateList(LIST_KEY__PROJECT_LIST))
        
    } else if ( d.entity_name == 'sprint' ) {
        dispatch(invalidateList(LIST_KEY__SPRINT_LIST))
	
    } else if ( d.entity_name == 'issue' ) {
        dispatch(invalidateList(LIST_KEY__ISSUE_LIST))
	
    } else {
        console.log("Unknown entity to refresh lists: " + d.entity_name)
    }
    
}

function refreshMiddleware(_ref) {

    var dispatch = _ref.dispatch;
    var getState = _ref.getState;
    
    return function (next) {
        return function (action) {
            
            const state = getState()
            if (action && action.type == ASYNC_REFRESH_NOTIFICATION) {

                const payload = action.payload || [{}]

                payload.map((d) => {
                    if ( d.action_type == "create" ) {
                        triggerInvalidateItemLists(d, dispatch)
                    } else if ( d.action_type == "update" ) {
                        triggerInvalidateEntity(d, dispatch)
                    } else { 
                        console.log("Unknown action_type for async refresh: " + d.action_type)
                    }
                }) 
            } 
            return next(action)
        }
    }
}

module.exports = refreshMiddleware
